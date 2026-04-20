const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'db.json');

const defaultData = {
  meta: {
    users: 5,
    students: 2,
    companies: 2,
    jobs: 2,
    applications: 2
  },
  users: [
    {
      id: 1,
      email: 'admin@college.edu',
      password: '$2b$10$bkgrsMlehBShInaHKT0mnegCl1pdmWAqUnHFCR04AFFA488xih3eq',
      role: 'admin',
      created_at: '2026-03-24T00:00:00.000Z'
    },
    {
      id: 2,
      email: 'recruiter1@company.com',
      password: '$2b$10$bkgrsMlehBShInaHKT0mnegCl1pdmWAqUnHFCR04AFFA488xih3eq',
      role: 'recruiter',
      created_at: '2026-03-24T00:00:00.000Z'
    },
    {
      id: 3,
      email: 'recruiter2@company.com',
      password: '$2b$10$bkgrsMlehBShInaHKT0mnegCl1pdmWAqUnHFCR04AFFA488xih3eq',
      role: 'recruiter',
      created_at: '2026-03-24T00:00:00.000Z'
    },
    {
      id: 4,
      email: 'student1@college.edu',
      password: '$2b$10$bkgrsMlehBShInaHKT0mnegCl1pdmWAqUnHFCR04AFFA488xih3eq',
      role: 'student',
      created_at: '2026-03-24T00:00:00.000Z'
    },
    {
      id: 5,
      email: 'student2@college.edu',
      password: '$2b$10$bkgrsMlehBShInaHKT0mnegCl1pdmWAqUnHFCR04AFFA488xih3eq',
      role: 'student',
      created_at: '2026-03-24T00:00:00.000Z'
    }
  ],
  students: [
    {
      id: 1,
      user_id: 4,
      name: 'John Doe',
      branch: 'Computer Science',
      cgpa: 8.5,
      skills: 'Java, Python',
      resume_link: '',
      phone: '1234567890',
      address: 'Address 1'
    },
    {
      id: 2,
      user_id: 5,
      name: 'Jane Smith',
      branch: 'Information Technology',
      cgpa: 9,
      skills: 'JavaScript, React',
      resume_link: '',
      phone: '0987654321',
      address: 'Address 2'
    }
  ],
  companies: [
    {
      id: 1,
      name: 'Tech Corp',
      description: 'Leading tech company',
      website: 'https://techcorp.com',
      contact_email: 'hr@techcorp.com',
      contact_phone: '1111111111',
      created_by: 2,
      created_at: '2026-03-24T00:00:00.000Z'
    },
    {
      id: 2,
      name: 'Innovate Ltd',
      description: 'Innovation driven',
      website: 'https://innovate.com',
      contact_email: 'jobs@innovate.com',
      contact_phone: '2222222222',
      created_by: 3,
      created_at: '2026-03-24T00:00:00.000Z'
    }
  ],
  jobs: [
    {
      id: 1,
      title: 'Software Engineer',
      description: 'Develop software',
      requirements: 'BTech in CS, 2 years exp',
      salary_min: 50000,
      salary_max: 80000,
      location: 'Bangalore',
      company_id: 1,
      posted_by: 2,
      posted_at: '2026-03-24T00:00:00.000Z',
      status: 'open'
    },
    {
      id: 2,
      title: 'Data Analyst',
      description: 'Analyze data',
      requirements: 'BTech, Statistics knowledge',
      salary_min: 40000,
      salary_max: 60000,
      location: 'Mumbai',
      company_id: 2,
      posted_by: 3,
      posted_at: '2026-03-24T00:00:00.000Z',
      status: 'open'
    }
  ],
  applications: [
    {
      id: 1,
      student_id: 1,
      job_id: 1,
      status: 'applied',
      applied_at: '2026-03-24T00:00:00.000Z',
      resume_path: null
    },
    {
      id: 2,
      student_id: 2,
      job_id: 2,
      status: 'shortlisted',
      applied_at: '2026-03-24T00:00:00.000Z',
      resume_path: null
    }
  ]
};

function ensureStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(defaultData, null, 2));
  }
}

function read() {
  ensureStore();
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function write(data) {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function nextId(data, collection) {
  data.meta[collection] = (data.meta[collection] || 0) + 1;
  return data.meta[collection];
}

function insert(collection, record) {
  const data = read();
  const id = nextId(data, collection);
  const newRecord = { id, ...record };
  data[collection].push(newRecord);
  write(data);
  return newRecord;
}

function update(collection, id, updates) {
  const data = read();
  const index = data[collection].findIndex((item) => item.id === Number(id));

  if (index === -1) {
    return null;
  }

  data[collection][index] = {
    ...data[collection][index],
    ...updates
  };

  write(data);
  return data[collection][index];
}

function remove(collection, id) {
  const data = read();
  const numericId = Number(id);
  const index = data[collection].findIndex((item) => item.id === numericId);

  if (index === -1) {
    return false;
  }

  data[collection].splice(index, 1);

  if (collection === 'users') {
    const student = data.students.find((item) => item.user_id === numericId);
    if (student) {
      data.students = data.students.filter((item) => item.id !== student.id);
      data.applications = data.applications.filter((item) => item.student_id !== student.id);
    }
    data.companies = data.companies.filter((item) => item.created_by !== numericId);
    data.jobs = data.jobs.filter((item) => item.posted_by !== numericId);
  }

  if (collection === 'students') {
    data.applications = data.applications.filter((item) => item.student_id !== numericId);
  }

  if (collection === 'companies') {
    const removedJobIds = data.jobs.filter((item) => item.company_id === numericId).map((item) => item.id);
    data.jobs = data.jobs.filter((item) => item.company_id !== numericId);
    data.applications = data.applications.filter((item) => !removedJobIds.includes(item.job_id));
  }

  if (collection === 'jobs') {
    data.applications = data.applications.filter((item) => item.job_id !== numericId);
  }

  write(data);
  return true;
}

function paginate(items, limit, offset) {
  return items.slice(offset, offset + limit);
}

module.exports = {
  defaultData,
  read,
  write,
  insert,
  update,
  remove,
  paginate
};
