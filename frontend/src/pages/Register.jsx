import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const COURSES = ['B.Tech', 'M.Tech', 'MBA', 'BBA', 'Ph.D'];
const BRANCHES = {
  'B.Tech': ['CSE', 'IT', 'ECE', 'EEE', 'MAE', 'ICE', 'MPAE', 'BT'],
  'M.Tech': ['CSE', 'IT', 'ECE', 'EEE', 'MAE'],
  'MBA': ['General', 'Finance', 'Marketing'],
  'BBA': ['General', 'Finance', 'Marketing'],
  'Ph.D': ['CSE', 'IT', 'ECE', 'EEE', 'MAE']
};

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    course: '',
    branch: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const nsutEmailRegex = /@nsut\.ac\.in$/;
    return nsutEmailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    console.log('Form submitted with data:', {
      ...formData,
      password: '[REDACTED]',
      confirmPassword: '[REDACTED]'
    });

    // Validate email
    if (!validateEmail(formData.email)) {
      setError('Please use your NSUT email address (@nsut.ac.in)');
      return;
    }

    // Validate password
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate course selection
    if (!formData.course) {
      setError('Please select your course');
      return;
    }

    // Validate branch selection
    if (!formData.branch) {
      setError('Please select your branch');
      return;
    }

    setIsLoading(true);
    console.log('Making registration request...');
    register(formData.email, formData.password, formData.course, formData.branch)
      .then(() => {
        console.log('Registration successful, navigating to dashboard...');
        navigate('/dashboard');
      })
      .catch((err) => {
        console.error('Registration failed:', err);
        setError(typeof err === 'string' ? err : 'Registration failed. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset branch if course changes
      ...(name === 'course' ? { branch: '' } : {})
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="large" message="Creating your account..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="NSUT Email address (@nsut.ac.in)"
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password (minimum 6 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
              />
            </div>

            <div>
              <label htmlFor="course" className="sr-only">
                Course
              </label>
              <select
                id="course"
                name="course"
                required
                value={formData.course}
                onChange={handleChange}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              >
                <option value="">Select Course</option>
                {COURSES.map(course => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {formData.course && (
              <div>
                <label htmlFor="branch" className="sr-only">
                  Branch
                </label>
                <select
                  id="branch"
                  name="branch"
                  required
                  value={formData.branch}
                  onChange={handleChange}
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                >
                  <option value="">Select Branch</option>
                  {BRANCHES[formData.course]?.map(branch => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
