export default defineNuxtRouteMiddleware((to) => {
  if (process.client) {
    if (to.path.includes('gate.html') || to.path.includes('go.html')) return;

    const queryPassed = to.query.gate === 'passed';
    if (queryPassed) {
      sessionStorage.setItem('gate_passed', '1');
      return;
    }

    const gatePassed = sessionStorage.getItem('gate_passed');
    if (!gatePassed) {
      window.location.href = '/gate.html';
    }
  }
})
