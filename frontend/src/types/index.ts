export interface College {
  id: string;
  name: string;
  location: string;
  state: string;
  city: string;
  fees_min: number;
  fees_max: number;
  rating: number;
  rating_count: number;
  type: string;
  established?: number;
  website?: string;
  image_url?: string;
  description?: string;
  placement_percentage?: number;
  avg_package?: number;
  highest_package?: number;
  total_students?: number;
  accreditation?: string;
  ranking?: number;
  courses?: { name: string; duration: string; fees: number }[];
  facilities?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Question {
  id: string;
  user_id: string;
  college_id?: string;
  title: string;
  body: string;
  votes: number;
  created_at: string;
  author_name: string;
  college_name?: string;
  answer_count?: number;
}

export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  body: string;
  votes: number;
  created_at: string;
  author_name: string;
}

export interface CollegesResponse {
  colleges: College[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
