const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function decodePdfLiteral(value) {
    let output = '';
    for (let i = 0; i < value.length; i += 1) {
        const char = value[i];
        if (char === '\\' && i + 1 < value.length) {
            i += 1;
            output += {
                n: '\n',
                r: '\r',
                t: '\t',
                b: '\b',
                f: '\f',
                '(': '(',
                ')': ')',
                '\\': '\\'
            }[value[i]] || value[i];
        } else {
            output += char;
        }
    }
    return output;
}

function extractText(block) {
    const parts = [];
    const arrayPattern = /\[(.*?)\]\s*TJ/gs;
    const literalPattern = /\((?:\\.|[^\\)])*\)/gs;
    let match;

    while ((match = arrayPattern.exec(block))) {
        const literals = match[1].match(literalPattern) || [];
        literals.forEach((literal) => parts.push(decodePdfLiteral(literal.slice(1, -1))));
    }

    const singlePattern = /(\((?:\\.|[^\\)])*\))\s*Tj/gs;
    while ((match = singlePattern.exec(block))) {
        parts.push(decodePdfLiteral(match[1].slice(1, -1)));
    }

    return parts.join('').trim();
}

function cleanText(value) {
    return String(value || '')
        .replace(/\\/g, '')
        .replace(/\s+/g, ' ')
        .replace(/Perf ormance/g, 'Performance')
        .replace(/Developmen t/g, 'Development')
        .replace(/Applicab le/g, 'Applicable')
        .replace(/Intern\/Com petition/g, 'Intern/Competition')
        .replace(/Com petition/g, 'Competition')
        .replace(/Eng\/Internsh ip/g, 'Eng/Internship')
        .replace(/Front End/g, 'Frontend')
        .replace(/Ba ckend/g, 'Backend')
        .replace(/Analo g/g, 'Analog')
        .trim();
}

function parseBoxes(pdfPath) {
    const data = fs.readFileSync(pdfPath);
    const streamPattern = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    const boxesByStream = [];
    let streamNumber = 0;
    let streamMatch;

    while ((streamMatch = streamPattern.exec(data.toString('latin1')))) {
        let decoded;
        try {
            decoded = zlib.inflateSync(Buffer.from(streamMatch[1], 'latin1')).toString('latin1');
        } catch (error) {
            streamNumber += 1;
            continue;
        }

        const boxes = [];
        const textBlockPattern = /BT([\s\S]*?)ET/g;
        let blockMatch;
        while ((blockMatch = textBlockPattern.exec(decoded))) {
            const text = extractText(blockMatch[1]);
            if (!text) continue;

            const prefix = decoded.slice(Math.max(0, blockMatch.index - 180), blockMatch.index);
            const cmMatches = [...prefix.matchAll(/([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+cm/g)];
            if (!cmMatches.length) continue;

            const cm = cmMatches[cmMatches.length - 1];
            boxes.push({
                x: Number(cm[5]),
                y: Number(cm[6]),
                text: cleanText(text)
            });
        }

        if (boxes.length > 20) {
            boxesByStream.push({ streamNumber, boxes });
        }
        streamNumber += 1;
    }

    return boxesByStream;
}

function columnText(rowBoxes, minX, maxX) {
    return cleanText(rowBoxes
        .filter((box) => box.x >= minX && box.x < maxX)
        .sort((a, b) => (b.y - a.y) || (a.x - b.x))
        .map((box) => box.text)
        .join(' '));
}

function normalizeDate(rawDate) {
    const digits = cleanText(rawDate).replace(/[^\d/]/g, '');
    const match = digits.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    return `${match[3]}-${match[2]}-${match[1]}`;
}

function extractPlacementRows(pdfPath) {
    const streams = parseBoxes(pdfPath);
    const rows = [];

    streams.forEach(({ streamNumber, boxes }) => {
        const serialBoxes = boxes
            .filter((box) => box.x >= 45 && box.x <= 65 && /^\d+$/.test(box.text))
            .sort((a, b) => b.y - a.y);
        const starts = [];

        for (let index = 0; index < serialBoxes.length;) {
            const parts = [serialBoxes[index]];
            let next = index + 1;

            while (
                next < serialBoxes.length &&
                parts[parts.length - 1].y - serialBoxes[next].y >= 8 &&
                parts[parts.length - 1].y - serialBoxes[next].y <= 24 &&
                parts.map((part) => part.text).join('').length < 3
            ) {
                parts.push(serialBoxes[next]);
                next += 1;
            }

            starts.push({
                serial: Number(parts.map((part) => part.text).join('')),
                top: parts[0].y
            });
            index = next;
        }

        starts.sort((a, b) => b.top - a.top);

        starts.forEach((start, index) => {
            const lower = index + 1 < starts.length ? starts[index + 1].top : -999;
            const rowBoxes = boxes.filter((box) => box.y <= start.top + 5 && box.y > lower + 5);
            const company = columnText(rowBoxes, 125, 235);
            const profile = columnText(rowBoxes, 470, 570);

            if (!company && !profile) return;

            const driveDateRaw = columnText(rowBoxes, 68, 125);
            const offerType = columnText(rowBoxes, 235, 315);
            const eligibleBranches = columnText(rowBoxes, 315, 415);
            const cgpaCriteria = columnText(rowBoxes, 415, 470);

            rows.push({
                sourceSerial: start.serial,
                driveDateRaw,
                driveDate: normalizeDate(driveDateRaw),
                companyName: company || 'Unknown Company',
                offerType,
                eligibleBranches,
                cgpaCriteria,
                profile: profile || 'Placement Role',
                pageStream: streamNumber,
                rawText: cleanText([driveDateRaw, company, offerType, eligibleBranches, cgpaCriteria, profile].join(' | '))
            });
        });
    });

    return rows;
}

if (require.main === module) {
    const pdfPath = process.argv[2] || path.join(__dirname, '..', '..', 'EDPEEE.pdf');
    const rows = extractPlacementRows(pdfPath);
    console.log(JSON.stringify({ count: rows.length, rows: rows.slice(0, 20) }, null, 2));
}

module.exports = {
    extractPlacementRows,
    normalizeDate
};
