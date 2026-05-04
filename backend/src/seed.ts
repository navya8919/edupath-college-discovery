import db from './db';
import { v4 as uuidv4 } from 'uuid';

function avatar(name: string, bg: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=128&bold=true&font-size=0.33`;
}

const collegesData = [
  {
    name: 'Indian Institute of Technology Madras',
    location: 'Chennai, Tamil Nadu', state: 'Tamil Nadu', city: 'Chennai',
    fees_min: 75000, fees_max: 190000, rating: 4.9, rating_count: 5500,
    type: 'Government', established: 1959, website: 'https://www.iitm.ac.in',
    image_url: avatar('IIT Madras', '1e3a8a'),
    description: 'IIT Madras is ranked #1 in engineering in India (NIRF 2023). Known for world-class research, innovation, and a sprawling forest campus in Chennai.',
    placement_percentage: 96.1, avg_package: 2200000, highest_package: 28000000, total_students: 9200,
    accreditation: 'NAAC A++', ranking: 1,
    courses: JSON.stringify([{ name: 'B.Tech Computer Science', duration: '4 years', fees: 190000 }, { name: 'B.Tech Electrical Engineering', duration: '4 years', fees: 190000 }, { name: 'M.Tech', duration: '2 years', fees: 95000 }, { name: 'Ph.D', duration: '4-5 years', fees: 50000 }]),
    facilities: JSON.stringify(['Library', 'Cricket Ground', 'Hostels', 'Research Labs', 'Marine Labs', 'Deer Park', 'Hospital']),
  },
  {
    name: 'Indian Institute of Technology Bombay',
    location: 'Mumbai, Maharashtra', state: 'Maharashtra', city: 'Mumbai',
    fees_min: 80000, fees_max: 200000, rating: 4.8, rating_count: 5200,
    type: 'Government', established: 1958, website: 'https://www.iitb.ac.in',
    image_url: avatar('IIT Bombay', '7c3aed'),
    description: 'IIT Bombay is one of the premier engineering institutions of India, globally known for cutting-edge research, innovation, and entrepreneurship.',
    placement_percentage: 95.2, avg_package: 2100000, highest_package: 25000000, total_students: 10000,
    accreditation: 'NAAC A++', ranking: 2,
    courses: JSON.stringify([{ name: 'B.Tech Computer Science', duration: '4 years', fees: 200000 }, { name: 'B.Tech Electrical Engineering', duration: '4 years', fees: 200000 }, { name: 'M.Tech', duration: '2 years', fees: 100000 }, { name: 'MBA', duration: '2 years', fees: 150000 }]),
    facilities: JSON.stringify(['Library', 'Sports Complex', 'Hostels', 'Research Labs', 'Wi-Fi Campus', 'Gymnasium', 'Bank']),
  },
  {
    name: 'Indian Institute of Technology Kharagpur',
    location: 'Kharagpur, West Bengal', state: 'West Bengal', city: 'Kharagpur',
    fees_min: 82000, fees_max: 195000, rating: 4.7, rating_count: 4600,
    type: 'Government', established: 1951, website: 'https://www.iitkgp.ac.in',
    image_url: avatar('IIT KGP', '1d4ed8'),
    description: "The oldest IIT, IIT Kharagpur spans 2100 acres and is known for its research output, distinguished alumni, and diverse academic programs.",
    placement_percentage: 93.8, avg_package: 1850000, highest_package: 20000000, total_students: 22000,
    accreditation: 'NAAC A++', ranking: 3,
    courses: JSON.stringify([{ name: 'B.Tech Computer Science', duration: '4 years', fees: 195000 }, { name: 'B.Tech Ocean Engineering', duration: '4 years', fees: 185000 }, { name: 'M.Tech', duration: '2 years', fees: 100000 }, { name: 'MBA', duration: '2 years', fees: 200000 }]),
    facilities: JSON.stringify(['Multiple Libraries', 'Olympic Pool', 'Hostels', 'Research Parks', 'Hospital', 'Shopping Center', 'Airport']),
  },
  {
    name: 'Indian Institute of Technology Delhi',
    location: 'New Delhi, Delhi', state: 'Delhi', city: 'New Delhi',
    fees_min: 85000, fees_max: 210000, rating: 4.7, rating_count: 4800,
    type: 'Government', established: 1961, website: 'https://www.iitd.ac.in',
    image_url: avatar('IIT Delhi', '0369a1'),
    description: "IIT Delhi is one of India's foremost institutions of higher education with a strong emphasis on research and entrepreneurship.",
    placement_percentage: 94.5, avg_package: 1950000, highest_package: 22000000, total_students: 8500,
    accreditation: 'NAAC A++', ranking: 3,
    courses: JSON.stringify([{ name: 'B.Tech Computer Science', duration: '4 years', fees: 210000 }, { name: 'B.Tech Mechanical Engineering', duration: '4 years', fees: 210000 }, { name: 'M.Tech', duration: '2 years', fees: 110000 }]),
    facilities: JSON.stringify(['Library', 'Sports Complex', 'Hostels', 'Research Labs', 'Medical Facility', 'Tennis Courts']),
  },
  {
    name: 'National Institute of Technology Trichy',
    location: 'Tiruchirappalli, Tamil Nadu', state: 'Tamil Nadu', city: 'Tiruchirappalli',
    fees_min: 60000, fees_max: 140000, rating: 4.5, rating_count: 2900,
    type: 'Government', established: 1964, website: 'https://www.nitt.edu',
    image_url: avatar('NIT Trichy', '065f46'),
    description: 'NIT Trichy is consistently ranked among the top NITs in India, known for quality technical education and excellent placements.',
    placement_percentage: 92.1, avg_package: 1400000, highest_package: 16000000, total_students: 6500,
    accreditation: 'NAAC A++', ranking: 4,
    courses: JSON.stringify([{ name: 'B.Tech Computer Science', duration: '4 years', fees: 140000 }, { name: 'B.Tech Production Engineering', duration: '4 years', fees: 130000 }, { name: 'M.Tech', duration: '2 years', fees: 75000 }]),
    facilities: JSON.stringify(['Library', 'Stadium', 'Hostels', 'Research Parks', 'Medical Center', 'Canteen']),
  },
  {
    name: 'BITS Pilani',
    location: 'Pilani, Rajasthan', state: 'Rajasthan', city: 'Pilani',
    fees_min: 400000, fees_max: 600000, rating: 4.6, rating_count: 4100,
    type: 'Private', established: 1964, website: 'https://www.bits-pilani.ac.in',
    image_url: avatar('BITS Pilani', 'b45309'),
    description: 'BITS Pilani is one of the top private engineering universities in India with a strong global alumni network and WILP programs.',
    placement_percentage: 90.3, avg_package: 1600000, highest_package: 18000000, total_students: 12000,
    accreditation: 'NAAC A', ranking: 5,
    courses: JSON.stringify([{ name: 'B.E. Computer Science', duration: '4 years', fees: 600000 }, { name: 'B.E. Electronics', duration: '4 years', fees: 580000 }, { name: 'M.Sc', duration: '2 years', fees: 300000 }, { name: 'MBA', duration: '2 years', fees: 400000 }]),
    facilities: JSON.stringify(['Library', 'Sports Complex', 'Hostels', 'Food Court', 'Auditorium', 'Medical Center', 'Innovation Center']),
  },
  {
    name: 'Jadavpur University',
    location: 'Kolkata, West Bengal', state: 'West Bengal', city: 'Kolkata',
    fees_min: 10000, fees_max: 50000, rating: 4.6, rating_count: 3100,
    type: 'Government', established: 1955, website: 'https://jadavpuruniversity.in',
    image_url: avatar('JU Kolkata', '831843'),
    description: 'Jadavpur University is a premier technical university in Eastern India, known for outstanding academic and research output at very affordable fees.',
    placement_percentage: 89.3, avg_package: 1050000, highest_package: 11000000, total_students: 18000,
    accreditation: 'NAAC A++', ranking: 6,
    courses: JSON.stringify([{ name: 'B.E. Computer Science', duration: '4 years', fees: 50000 }, { name: 'B.E. Electronics & Communication', duration: '4 years', fees: 50000 }, { name: 'B.E. Mechanical', duration: '4 years', fees: 45000 }]),
    facilities: JSON.stringify(['Library', 'Sports Complex', 'Hostels', 'Research Centers', 'Auditorium', 'Canteen']),
  },
  {
    name: 'Delhi Technological University',
    location: 'New Delhi, Delhi', state: 'Delhi', city: 'New Delhi',
    fees_min: 90000, fees_max: 160000, rating: 4.4, rating_count: 3700,
    type: 'Government', established: 1941, website: 'https://dtu.ac.in',
    image_url: avatar('DTU Delhi', '1e40af'),
    description: 'DTU (formerly DCE) is one of the oldest and premier engineering institutions of Delhi with excellent placement records and strong alumni.',
    placement_percentage: 88.2, avg_package: 1100000, highest_package: 14000000, total_students: 13000,
    accreditation: 'NAAC A', ranking: 8,
    courses: JSON.stringify([{ name: 'B.Tech Computer Science', duration: '4 years', fees: 160000 }, { name: 'B.Tech Software Engineering', duration: '4 years', fees: 160000 }, { name: 'B.Tech Environmental Engineering', duration: '4 years', fees: 140000 }]),
    facilities: JSON.stringify(['Library', 'Sports Complex', 'Hostels', 'Cafeteria', 'Innovation Center', 'Auditorium']),
  },
  {
    name: 'National Institute of Technology Surathkal',
    location: 'Surathkal, Karnataka', state: 'Karnataka', city: 'Surathkal',
    fees_min: 65000, fees_max: 130000, rating: 4.4, rating_count: 2500,
    type: 'Government', established: 1960, website: 'https://www.nitk.ac.in',
    image_url: avatar('NITK Surathkal', '166534'),
    description: 'NIT Surathkal (NITK) is a premier NIT on the western coast of India, known for its picturesque beachside campus and strong technical education.',
    placement_percentage: 88.5, avg_package: 1250000, highest_package: 13000000, total_students: 7200,
    accreditation: 'NAAC A++', ranking: 9,
    courses: JSON.stringify([{ name: 'B.Tech Computer Science', duration: '4 years', fees: 130000 }, { name: 'B.Tech Chemical Engineering', duration: '4 years', fees: 120000 }]),
    facilities: JSON.stringify(['Library', 'Beach Campus', 'Hostels', 'Sports Complex', 'Gymnasium', 'Medical Center']),
  },
  {
    name: 'Manipal Institute of Technology',
    location: 'Manipal, Karnataka', state: 'Karnataka', city: 'Manipal',
    fees_min: 300000, fees_max: 500000, rating: 4.3, rating_count: 3200,
    type: 'Private', established: 1957, website: 'https://manipal.edu/mit.html',
    image_url: avatar('MIT Manipal', '9f1239'),
    description: 'Manipal Institute of Technology is one of the top private engineering colleges in India, known for excellent placements and international exposure.',
    placement_percentage: 85.7, avg_package: 1200000, highest_package: 12000000, total_students: 15000,
    accreditation: 'NAAC A+', ranking: 10,
    courses: JSON.stringify([{ name: 'B.Tech Computer Science', duration: '4 years', fees: 500000 }, { name: 'B.Tech Mechatronics', duration: '4 years', fees: 480000 }, { name: 'B.Tech AI & Data Science', duration: '4 years', fees: 500000 }]),
    facilities: JSON.stringify(['Library', 'Swimming Pool', 'Hostels', 'Food Court', 'Gym', 'Shopping Center', 'Hospital']),
  },
  {
    name: 'VIT University',
    location: 'Vellore, Tamil Nadu', state: 'Tamil Nadu', city: 'Vellore',
    fees_min: 200000, fees_max: 400000, rating: 4.2, rating_count: 6800,
    type: 'Private', established: 1984, website: 'https://vit.ac.in',
    image_url: avatar('VIT Vellore', '6b21a8'),
    description: 'VIT University is a Deemed University offering technology and engineering education with global collaborations and strong placement support.',
    placement_percentage: 82.4, avg_package: 900000, highest_package: 9000000, total_students: 35000,
    accreditation: 'NAAC A++', ranking: 12,
    courses: JSON.stringify([{ name: 'B.Tech Computer Science', duration: '4 years', fees: 400000 }, { name: 'B.Tech AI & ML', duration: '4 years', fees: 400000 }, { name: 'B.Tech Bioinformatics', duration: '4 years', fees: 350000 }]),
    facilities: JSON.stringify(['Multiple Libraries', 'Sports Complex', 'Hostels', 'Shopping Mall', 'Hospitals', 'Restaurants']),
  },
  {
    name: 'PSG College of Technology',
    location: 'Coimbatore, Tamil Nadu', state: 'Tamil Nadu', city: 'Coimbatore',
    fees_min: 100000, fees_max: 175000, rating: 4.3, rating_count: 2200,
    type: 'Private', established: 1951, website: 'https://www.psgtech.edu',
    image_url: avatar('PSG Coimbatore', '4c1d95'),
    description: 'PSG College of Technology is one of the premier engineering institutions in Tamil Nadu, known for discipline, research and strong industry ties.',
    placement_percentage: 87.2, avg_package: 900000, highest_package: 8000000, total_students: 5400,
    accreditation: 'NAAC A++', ranking: 13,
    courses: JSON.stringify([{ name: 'B.E. Computer Science', duration: '4 years', fees: 175000 }, { name: 'B.E. Mechanical', duration: '4 years', fees: 160000 }, { name: 'M.E.', duration: '2 years', fees: 90000 }]),
    facilities: JSON.stringify(['Library', 'Sports Ground', 'Hostel', 'Workshop', 'Canteen', 'NSS']),
  },
  {
    name: 'Thapar Institute of Engineering and Technology',
    location: 'Patiala, Punjab', state: 'Punjab', city: 'Patiala',
    fees_min: 350000, fees_max: 550000, rating: 4.3, rating_count: 2100,
    type: 'Private', established: 1956, website: 'https://www.thapar.edu',
    image_url: avatar('Thapar Patiala', 'c2410c'),
    description: 'Thapar Institute is a top-ranked private engineering university in North India, known for research output and strong industry partnerships.',
    placement_percentage: 86.9, avg_package: 1150000, highest_package: 11000000, total_students: 12000,
    accreditation: 'NAAC A', ranking: 14,
    courses: JSON.stringify([{ name: 'B.E. Computer Engineering', duration: '4 years', fees: 550000 }, { name: 'B.E. Mechanical Engineering', duration: '4 years', fees: 530000 }, { name: 'M.E.', duration: '2 years', fees: 280000 }]),
    facilities: JSON.stringify(['Library', 'Sports Complex', 'Hostels', 'Food Court', 'Medical Center', 'Entrepreneurship Cell']),
  },
  {
    name: 'Pune Institute of Computer Technology',
    location: 'Pune, Maharashtra', state: 'Maharashtra', city: 'Pune',
    fees_min: 120000, fees_max: 200000, rating: 4.2, rating_count: 1800,
    type: 'Private', established: 1983, website: 'https://www.pict.edu',
    image_url: avatar('PICT Pune', '374151'),
    description: 'PICT is one of the top engineering colleges in Pune known for its exceptional placement record in the IT industry.',
    placement_percentage: 91.5, avg_package: 1300000, highest_package: 10000000, total_students: 3200,
    accreditation: 'NAAC A', ranking: 15,
    courses: JSON.stringify([{ name: 'B.E. Computer Engineering', duration: '4 years', fees: 200000 }, { name: 'B.E. Information Technology', duration: '4 years', fees: 190000 }, { name: 'B.E. Electronics', duration: '4 years', fees: 180000 }]),
    facilities: JSON.stringify(['Library', 'Sports Ground', 'NSS Wing', 'Placement Cell', 'Canteen', 'Workshop']),
  },
  {
    name: 'University of Hyderabad',
    location: 'Hyderabad, Telangana', state: 'Telangana', city: 'Hyderabad',
    fees_min: 20000, fees_max: 80000, rating: 4.5, rating_count: 3000,
    type: 'Government', established: 1974, website: 'https://uohyd.ac.in',
    image_url: avatar('UoH Hyderabad', '0c4a6e'),
    description: 'University of Hyderabad (UoH) is a central university known for excellent research programs in science, humanities, and social sciences.',
    placement_percentage: 82.0, avg_package: 780000, highest_package: 8000000, total_students: 7000,
    accreditation: 'NAAC A++', ranking: 16,
    courses: JSON.stringify([{ name: 'M.Sc Computer Science', duration: '2 years', fees: 80000 }, { name: 'MBA', duration: '2 years', fees: 70000 }, { name: 'Ph.D', duration: '4-5 years', fees: 30000 }]),
    facilities: JSON.stringify(['Library', 'Observatory', 'Hostels', 'Deer Park', 'Medical Center', 'Cultural Center']),
  },
  {
    name: 'Vellore Institute of Technology Chennai',
    location: 'Chennai, Tamil Nadu', state: 'Tamil Nadu', city: 'Chennai',
    fees_min: 220000, fees_max: 420000, rating: 4.1, rating_count: 3400,
    type: 'Private', established: 2010, website: 'https://chennai.vit.ac.in',
    image_url: avatar('VIT Chennai', '581c87'),
    description: 'VIT Chennai campus offers cutting-edge engineering programs in a vibrant metropolitan environment with excellent industry connectivity.',
    placement_percentage: 83.7, avg_package: 920000, highest_package: 9500000, total_students: 18000,
    accreditation: 'NAAC A++', ranking: 17,
    courses: JSON.stringify([{ name: 'B.Tech Computer Science', duration: '4 years', fees: 420000 }, { name: 'B.Tech Bioengineering', duration: '4 years', fees: 380000 }]),
    facilities: JSON.stringify(['Library', 'Sports Complex', 'Hostels', 'Food Court', 'Medical Center']),
  },
  {
    name: 'SRM Institute of Science and Technology',
    location: 'Chennai, Tamil Nadu', state: 'Tamil Nadu', city: 'Chennai',
    fees_min: 180000, fees_max: 380000, rating: 4.0, rating_count: 5100,
    type: 'Private', established: 1985, website: 'https://www.srmist.edu.in',
    image_url: avatar('SRM Chennai', '0f766e'),
    description: 'SRM Institute of Science and Technology is a deemed university with strong industry connections and global academic partnerships.',
    placement_percentage: 78.9, avg_package: 750000, highest_package: 7500000, total_students: 52000,
    accreditation: 'NAAC A++', ranking: 18,
    courses: JSON.stringify([{ name: 'B.Tech Computer Science', duration: '4 years', fees: 380000 }, { name: 'BBA', duration: '3 years', fees: 200000 }, { name: 'MBA', duration: '2 years', fees: 380000 }]),
    facilities: JSON.stringify(['Library', 'Sports Ground', 'Hostels', 'Medical Center', 'Shopping Complex', 'Bank']),
  },
  {
    name: 'Birla Institute of Technology Mesra',
    location: 'Ranchi, Jharkhand', state: 'Jharkhand', city: 'Ranchi',
    fees_min: 180000, fees_max: 320000, rating: 4.1, rating_count: 1900,
    type: 'Private', established: 1955, website: 'https://www.bitmesra.ac.in',
    image_url: avatar('BIT Mesra', '065f46'),
    description: 'BIT Mesra is one of the oldest private technical institutions in India, known for its unique forest campus and strong engineering programs.',
    placement_percentage: 80.5, avg_package: 850000, highest_package: 9000000, total_students: 8500,
    accreditation: 'NAAC A', ranking: 20,
    courses: JSON.stringify([{ name: 'B.Tech Computer Science', duration: '4 years', fees: 320000 }, { name: 'B.Tech Electronics', duration: '4 years', fees: 300000 }]),
    facilities: JSON.stringify(['Library', 'Forest Campus', 'Hostels', 'Sports Complex', 'Medical Center']),
  },
  {
    name: 'JNTU Hyderabad',
    location: 'Hyderabad, Telangana', state: 'Telangana', city: 'Hyderabad',
    fees_min: 40000, fees_max: 90000, rating: 4.0, rating_count: 8500,
    type: 'Government', established: 1972, website: 'https://www.jntuh.ac.in',
    image_url: avatar('JNTU Hyderabad', '7f1d1d'),
    description: 'JNTU Hyderabad is a prominent technical university in South India with a vast network of affiliated colleges across Telangana and Andhra Pradesh.',
    placement_percentage: 76.3, avg_package: 650000, highest_package: 5500000, total_students: 45000,
    accreditation: 'NAAC A', ranking: 22,
    courses: JSON.stringify([{ name: 'B.Tech Computer Science', duration: '4 years', fees: 90000 }, { name: 'B.Tech Electronics', duration: '4 years', fees: 85000 }, { name: 'MBA', duration: '2 years', fees: 75000 }]),
    facilities: JSON.stringify(['Library', 'Sports Complex', 'Hostels', 'Auditorium', 'Research Centers']),
  },
  {
    name: 'Amity University',
    location: 'Noida, Uttar Pradesh', state: 'Uttar Pradesh', city: 'Noida',
    fees_min: 250000, fees_max: 450000, rating: 3.9, rating_count: 4500,
    type: 'Private', established: 2005, website: 'https://www.amity.edu',
    image_url: avatar('Amity Noida', '92400e'),
    description: 'Amity University is a leading private university with a modern campus, strong industry connections, and global academic programs.',
    placement_percentage: 75.6, avg_package: 680000, highest_package: 6000000, total_students: 125000,
    accreditation: 'NAAC A+', ranking: 25,
    courses: JSON.stringify([{ name: 'B.Tech Computer Science', duration: '4 years', fees: 450000 }, { name: 'BCA', duration: '3 years', fees: 250000 }, { name: 'MBA', duration: '2 years', fees: 400000 }]),
    facilities: JSON.stringify(['Library', 'Olympic Pool', 'Hostels', 'Food Court', 'Shopping Center', 'Amphitheater']),
  },
];

export async function seedDatabase() {
  const existing = db.prepare('SELECT COUNT(*) as count FROM colleges').get() as { count: number };
  if (existing.count > 0) {
    console.log('📦 Database already seeded with', existing.count, 'colleges — skipping.');
    return;
  }

  const insert = db.prepare(`
    INSERT INTO colleges (id, name, location, state, city, fees_min, fees_max, rating, rating_count,
      type, established, website, image_url, description, placement_percentage, avg_package,
      highest_package, total_students, accreditation, ranking, courses, facilities)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION');
  try {
    for (const c of collegesData) {
      insert.run(
        uuidv4(), c.name, c.location, c.state, c.city, c.fees_min, c.fees_max,
        c.rating, c.rating_count, c.type, c.established, c.website, c.image_url,
        c.description, c.placement_percentage, c.avg_package, c.highest_package,
        c.total_students, c.accreditation, c.ranking, c.courses, c.facilities
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  console.log(`✅ Seeded ${collegesData.length} colleges successfully`);
}
