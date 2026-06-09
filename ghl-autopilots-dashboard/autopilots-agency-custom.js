(function () {
  function enableAutopilotsSkin() {
    document.body.classList.add("ap-saas-ui");
  }

  if (document.body) {
    enableAutopilotsSkin();
  } else {
    document.addEventListener("DOMContentLoaded", enableAutopilotsSkin);
  }
})();
