import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    // 1. INCREASE THE 'TARGET' VALUE HERE
    { duration: '30s', target: 100 }, // Ramp-up to 100 virtual users

    // AND HERE
    { duration: '1m', target: 100 },  // Stay at 100 virtual users for 1 minute

    { duration: '10s', target: 0 },   // Ramp-down to 0 users
  ],
};

const BASE_URL = 'http://localhost:3001'; // Your server's URL

export default function () {
  // ... (rest of the script is fine)
  const url = `${BASE_URL}/Hack/register`;
  const payload = JSON.stringify({
    name: `TestUser${__VU}${__ITER}`, // Added __ITER to ensure unique users on re-runs
    email: `testuser${__VU}${__ITER}@example.com`,
    teamname: `TestTeam${__VU}${__ITER}`,
    teamMembers: [
      { name: 'Member 1', registrationNumber: '1111' },
      { name: 'Member 2', registrationNumber: '2222' },
      { name: 'Member 3', registrationNumber: '3333' },
      { name: 'Member 4', registrationNumber: '4444' },
    ],
  });
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };
  const res = http.post(url, payload, params);
  check(res, {
    'is status 201': (r) => r.status === 201,
  });

  // 2. DECREASE OR REMOVE THE SLEEP TIME HERE
  sleep(0.5); // Wait for half a second (previously 1s)
}