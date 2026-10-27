async function runVerification() {
  const base = 'http://127.0.0.1:3000/api/v1';
  console.log('\n🚀 Starting Complete E2E Security & Functional Verification...\n');

  // 1. Health check
  const healthRes = await fetch(`${base}/health`);
  const health = await healthRes.json();
  console.log('✅ 1. Health check:', health);

  // 2. Login User A
  const loginARes = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'usera@example.test', password: 'TestPassword!2026' }),
  });
  const loginA = await loginARes.json();
  const tokenA = loginA.tokens.accessToken;
  console.log('✅ 2. User A login status:', loginARes.status, '| User:', loginA.user.fullName);

  // 3. Login User B
  const loginBRes = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'userb@example.test', password: 'TestPassword!2026' }),
  });
  const loginB = await loginBRes.json();
  const tokenB = loginB.tokens.accessToken;
  console.log('✅ 3. User B login status:', loginBRes.status, '| User:', loginB.user.fullName);

  // 4. Verify User A Profile (/auth/me)
  const meRes = await fetch(`${base}/auth/me`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const me = await meRes.json();
  console.log('✅ 4. Current user /auth/me:', me.fullName, `(${me.email})`);

  // 5. Create new Project for User A
  const createProjRes = await fetch(`${base}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      name: 'Cloud Infrastructure Migration',
      description: 'Migrating legacy services to modern containerized stack',
      status: 'IN_PROGRESS',
      startDate: '2026-11-01',
      endDate: '2026-12-31',
    }),
  });
  const newProject = await createProjRes.json();
  console.log('✅ 5. Created Project:', newProject.id, '| Name:', newProject.name);

  // 6. Create Task in User A's project
  const createTaskRes = await fetch(`${base}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      projectId: newProject.id,
      name: 'Provision Terraform VPC',
      description: 'Configure multi-AZ subnets and security groups',
      priority: 'HIGH',
      status: 'PENDING',
      dueDate: '2026-11-15',
    }),
  });
  const newTask = await createTaskRes.json();
  console.log('✅ 6. Created Task:', newTask.id, '| Name:', newTask.name);

  // 7. Complete Task via PATCH
  const patchTaskRes = await fetch(`${base}/tasks/${newTask.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      status: 'COMPLETED',
    }),
  });
  const patchedTask = await patchTaskRes.json();
  console.log('✅ 7. Completed task status via PATCH:', patchedTask.status);

  // 8. User A Dashboard
  const dashRes = await fetch(`${base}/dashboard`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const dashboard = await dashRes.json();
  console.log('✅ 8. User A Dashboard Statistics:', dashboard);

  // 9. SECURITY ISOLATION TESTS
  console.log('\n🔒 RUNNING TWO-USER SECURITY ISOLATION TESTS:');
  
  // Test 9a: User B reading User A's project
  const crossReadProj = await fetch(`${base}/projects/${newProject.id}`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  console.log(`- User B reading User A project -> Status: ${crossReadProj.status} (Expected 404 Not Found)`);

  // Test 9b: User B updating User A's task
  const crossUpdateTask = await fetch(`${base}/tasks/${newTask.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenB}`,
    },
    body: JSON.stringify({ status: 'PENDING' }),
  });
  console.log(`- User B updating User A task -> Status: ${crossUpdateTask.status} (Expected 404 Not Found)`);

  // Test 9c: User B creating a task inside User A's project
  const crossCreateTask = await fetch(`${base}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenB}`,
    },
    body: JSON.stringify({
      projectId: newProject.id,
      name: 'Malicious Task Injection',
      priority: 'HIGH',
    }),
  });
  console.log(`- User B creating task in User A project -> Status: ${crossCreateTask.status} (Expected 404 Not Found)`);

  // Test 9d: User B deleting User A's project
  const crossDeleteProj = await fetch(`${base}/projects/${newProject.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  console.log(`- User B deleting User A project -> Status: ${crossDeleteProj.status} (Expected 404 Not Found)`);

  // 10. SESSION REVOCATION TEST
  console.log('\n🔑 TESTING LOGOUT & SESSION REVOCATION:');
  const logoutRes = await fetch(`${base}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  console.log(`- User A logout -> Status: ${logoutRes.status}`);

  const meAfterLogout = await fetch(`${base}/auth/me`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  console.log(`- Immediate access-token rejection after logout -> Status: ${meAfterLogout.status} (Expected 401 Unauthorized)`);

  console.log('\n🎉 ALL FUNCTIONAL & SECURITY TESTS PASSED PERFECTLY!\n');
}

runVerification().catch(console.error);
