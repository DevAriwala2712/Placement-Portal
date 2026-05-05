import pdfplumber
import re

PDF_PATH = '../../EDPEEE.pdf'
SQL_PATH = 'seed_data.sql'

def clean(s):
    if s is None:
        return ''
    return re.sub(r'\s+', ' ', str(s).replace('\n', ' ')).strip()

def parse_cgpa(s):
    if not s or 'No' in s or 'Not' in s or 'NA' in s.upper():
        return 0.0
    m = re.search(r'\d+(\.\d+)?', s)
    return float(m.group()) if m else 0.0

def is_date(s):
    return bool(re.search(r'\d{2}/\d{2}/\d{4}|\d+/\d+/\d+|\d{2}/\d{2}/\d{2}', s.replace(' ', '')))

def is_index(s):
    return bool(re.fullmatch(r'\d{1,3}', s.strip()))

def is_company(s):
    """Heuristic: not a date, not a number, not a branch code, at least 2 chars"""
    if not s or len(s) < 2:
        return False
    if is_index(s) or is_date(s):
        return False
    # Branch-only strings like "COE, COPC" shouldn't be company names
    branch_codes = {'COE','COPC','COBS','ENC','ECE','EIC','EEC','ELE','MEE','MEC','CHE','CIE','BME','BT','MCA'}
    words = set(re.split(r'[\s,/]+', s.strip()))
    if words.issubset(branch_codes):
        return False
    # Type-of-offer strings start with these words
    type_starters = ('intern','fte','ppo','performance','based','chance','off-campus','not applicable','no cgpa')
    if s.lower().startswith(tuple(type_starters)):
        return False
    return True

def extract():
    companies = {}
    jobs = []
    company_counter = 1
    role_counter = 1
    current_company = None

    with pdfplumber.open(PDF_PATH) as pdf:
        for page_num, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    if not row or not any(row):
                        continue

                    cells = [clean(x) for x in row]
                    n = len(cells)

                    # Skip header rows
                    joined = ' '.join(cells).lower()
                    if 'notification' in joined and 'date' in joined:
                        continue
                    if 'eligibility' in joined and 'branches' in joined:
                        continue

                    # Find non-empty cells in order
                    non_empty = [(i, v) for i, v in enumerate(cells) if v]
                    if len(non_empty) < 2:
                        continue

                    # Strategy: look for a row with a recognizable sequence:
                    # [optional_empty..., index, date, company, type, branches, cgpa, role]
                    # or partial rows that continue a company

                    # Find candidate company cell: the first non-empty cell that looks like a company
                    # after an index/date, typically in position 3-5
                    company_val = None
                    type_val = None
                    branches_val = None
                    cgpa_val_str = None
                    role_val = None

                    # Try known column offsets for 10-11 col rows (main table)
                    if n >= 10:
                        # Cols: [_, _, idx, date, company, type, branches, cgpa, role, _]
                        # or:   [_, idx, date, company, type, branches, cgpa, role, _, _]
                        for offset in [0, 1]:
                            idx_i = 1 + offset
                            date_i = 2 + offset
                            comp_i = 3 + offset
                            type_i = 4 + offset
                            bran_i = 5 + offset
                            cgpa_i = 6 + offset
                            role_i = 7 + offset

                            if comp_i < n and is_company(cells[comp_i]):
                                company_val = cells[comp_i]
                                type_val = cells[type_i] if type_i < n else ''
                                branches_val = cells[bran_i] if bran_i < n else ''
                                cgpa_val_str = cells[cgpa_i] if cgpa_i < n else ''
                                role_val = cells[role_i] if role_i < n else ''
                                break
                            elif comp_i < n and not cells[comp_i] and type_i < n and cells[type_i]:
                                # Continuation row: no company, has type and role
                                type_val = cells[type_i]
                                branches_val = cells[bran_i] if bran_i < n else ''
                                cgpa_val_str = cells[cgpa_i] if cgpa_i < n else ''
                                role_val = cells[role_i] if role_i < n else ''
                                break

                    if company_val:
                        current_company = company_val

                    # Record only if we have a role and a company context
                    if role_val and type_val and current_company:
                        if current_company not in companies:
                            companies[current_company] = company_counter
                            company_counter += 1

                        jobs.append({
                            'role_id': role_counter,
                            'company_id': companies[current_company],
                            'title': role_val[:490],
                            'type': type_val[:190],
                            'cgpa': parse_cgpa(cgpa_val_str or ''),
                            'branches': (branches_val or '')[:990],
                        })
                        role_counter += 1

    return companies, jobs


def write_sql(companies, jobs):
    with open(SQL_PATH, 'w') as f:
        f.write("SET DEFINE OFF;\n")
        f.write("-- Auto-generated seed data from EDPEEE.pdf\n\n")

        f.write("-- Default Users\n")
        f.write("INSERT INTO Users (user_id, email, password, role) VALUES (1, 'harmanjot@thapar.edu', 'password123', 'student');\n")
        f.write("INSERT INTO Users (user_id, email, password, role) VALUES (2, 'dev@thapar.edu', 'password123', 'student');\n")
        f.write("INSERT INTO Users (user_id, email, password, role) VALUES (3, 'rahul@thapar.edu', 'password123', 'student');\n\n")

        f.write("-- Default Students\n")
        f.write("INSERT INTO Students (user_id, name, cgpa, branch, grad_year, email) VALUES (1, 'Harmanjot Singh', 9.2, 'COPC', 2026, 'harmanjot@thapar.edu');\n")
        f.write("INSERT INTO Students (user_id, name, cgpa, branch, grad_year, email) VALUES (2, 'Dev Ariwala', 8.5, 'COE', 2026, 'dev@thapar.edu');\n")
        f.write("INSERT INTO Students (user_id, name, cgpa, branch, grad_year, email) VALUES (3, 'Rahul Sharma', 7.2, 'MEE', 2026, 'rahul@thapar.edu');\n\n")

        f.write("-- Companies from EDPEEE.pdf\n")
        for name, cid in companies.items():
            safe = name.replace("'", "''")
            f.write(f"INSERT INTO Companies (company_id, name, industry, location) VALUES ({cid}, '{safe}', 'Tech', 'India');\n")

        f.write("\n-- Job Roles from EDPEEE.pdf\n")
        for j in jobs:
            t = j['title'].replace("'", "''")
            tp = j['type'].replace("'", "''")
            b = j['branches'].replace("'", "''")
            f.write(
                f"INSERT INTO JobRoles (role_id, company_id, title, type_of_offer, package_ctc, eligibility_cgpa, branches_allowed) "
                f"VALUES ({j['role_id']}, {j['company_id']}, '{t}', '{tp}', 0, {j['cgpa']}, '{b}');\n"
            )

        f.write("\nCOMMIT;\n")


if __name__ == '__main__':
    companies, jobs = extract()
    write_sql(companies, jobs)
    print(f"Done: {len(companies)} companies, {len(jobs)} job roles -> {SQL_PATH}")
    # Quick sanity check
    names = list(companies.keys())[:10]
    print("First 10 companies:", names)
