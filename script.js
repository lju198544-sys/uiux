/* =========================================================
   내만세(내가 만드는 세상) script.js
   순서: 5주차(알림 신청) → 6주차(테마·탭·안전 수칙) → 7주차(제작 신청 흐름)
   ========================================================= */

/* ---------------------------------------------------------
   5주차 · 완료 알림 받기 (submit 이벤트)
   --------------------------------------------------------- */
const subscribeForm = document.querySelector("#subscribe-form");
const emailInput = document.querySelector("#email");
const subscribeMessage = document.querySelector("#subscribeMessage");
const subscribeButton = document.querySelector("#subscribeButton");

function handleSubscribe(event) {
  // 페이지가 새로고침되지 않게 막습니다.
  event.preventDefault();

  const email = emailInput.value.trim();

  if (email === "") {
    subscribeMessage.textContent = "알림 받을 이메일을 입력해 주세요.";
    subscribeMessage.classList.add("is-error");
    emailInput.classList.add("has-error");
    emailInput.focus();
    return;
  }

  if (!emailInput.checkValidity()) {
    subscribeMessage.textContent = "이메일 형식을 확인해 주세요. 예: name@example.com";
    subscribeMessage.classList.add("is-error");
    emailInput.classList.add("has-error");
    emailInput.focus();
    return;
  }

  // 성공: 문구 + 스타일 + 버튼 상태를 함께 바꿉니다.
  subscribeMessage.textContent = email + "(으)로 제작 완료 알림을 보내 드립니다.";
  subscribeMessage.classList.remove("is-error");
  subscribeMessage.classList.add("is-saved");
  emailInput.classList.remove("has-error");
  subscribeButton.textContent = "알림 신청 완료";
  subscribeButton.disabled = true;
}

subscribeForm.addEventListener("submit", handleSubscribe);


/* ---------------------------------------------------------
   6주차 · click: 화면 테마 전환
   --------------------------------------------------------- */
const themeButton = document.querySelector("#themeButton");

function handleThemeClick() {
  const isDark = document.body.classList.toggle("dark");

  themeButton.textContent = isDark ? "밝은 화면으로" : "어두운 화면으로";
  themeButton.setAttribute("aria-pressed", String(isDark));
}

themeButton.addEventListener("click", handleThemeClick);


/* ---------------------------------------------------------
   6주차 · 탭 UI (querySelectorAll + forEach + data-target)
   --------------------------------------------------------- */
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

function resetTabsAndPanels() {
  tabs.forEach(function (tab) {
    tab.classList.remove("is-active");
    tab.setAttribute("aria-selected", "false");
  });

  panels.forEach(function (panel) {
    panel.classList.remove("is-active");
    panel.hidden = true;
  });
}

function activateTab(clickedTab) {
  const targetSelector = clickedTab.dataset.target;
  const targetPanel = document.querySelector(targetSelector);

  clickedTab.classList.add("is-active");
  clickedTab.setAttribute("aria-selected", "true");

  targetPanel.classList.add("is-active");
  targetPanel.hidden = false;
}

function handleTabClick(event) {
  resetTabsAndPanels();
  activateTab(event.currentTarget);
}

tabs.forEach(function (tab) {
  tab.addEventListener("click", handleTabClick);
});


/* ---------------------------------------------------------
   6주차 · change: 안전 수칙 확인 → 시작 버튼 활성화
   --------------------------------------------------------- */
const agreeCheck = document.querySelector("#agreeCheck");
const agreeMessage = document.querySelector("#agreeMessage");
const startButton = document.querySelector("#startButton");

function handleAgreeChange() {
  const agreed = agreeCheck.checked;

  startButton.disabled = !agreed;
  agreeMessage.textContent = agreed
    ? "확인했습니다. 제작 신청을 시작할 수 있습니다."
    : "안전 수칙을 확인해야 제작 신청을 시작할 수 있습니다.";
  agreeMessage.classList.toggle("is-ready", agreed);
}

agreeCheck.addEventListener("change", handleAgreeChange);


/* ---------------------------------------------------------
   7주차 · 제작 신청 흐름
   진입 → 1 만들 것 → 2 재료·수령 → 3 내용 확인 → (팝업) → 4 완료
   --------------------------------------------------------- */

// 1) 흐름에서 쓰는 요소 찾기
const printFlow = document.querySelector("#printFlow");
const printSteps = document.querySelectorAll(".print-step");
const flowMarkers = document.querySelectorAll(".flow-steps li");
const printProgress = document.querySelector("#printProgress");

const modelName = document.querySelector("#modelName");
const modelError = document.querySelector("#modelError");
const requesterName = document.querySelector("#requesterName");
const nameCount = document.querySelector("#nameCount");
const nameError = document.querySelector("#nameError");
const purpose = document.querySelector("#purpose");
const purposeError = document.querySelector("#purposeError");

const material = document.querySelector("#material");
const materialHelp = document.querySelector("#materialHelp");
const pickup = document.querySelector("#pickup");
const visitDateField = document.querySelector("#visitDateField");
const visitDate = document.querySelector("#visitDate");
const dateError = document.querySelector("#dateError");

const printSummary = document.querySelector("#printSummary");
const confirmDialog = document.querySelector("#confirmDialog");
const printTicket = document.querySelector("#printTicket");
const doneGuide = document.querySelector("#doneGuide");
const doneTitle = document.querySelector("#doneTitle");
const purposeGuide = document.querySelector("#purposeGuide");

const stepNames = ["만들 것", "재료·수령 방법", "신청 내용 확인"];

const purposeGuides = {
  class: "결과물을 받으면 과제 제출 전에 크기와 맞물림을 한 번 더 확인해 보세요.",
  contest: "팀원과 결과물을 함께 써 보고, 고칠 점이 생기면 같은 이름으로 다시 신청하세요.",
  startup: "시제품을 주변 사람 다섯 명에게 써 보게 하고 반응을 기록해 보세요. 다음 버전의 출발점이 됩니다."
};

const materialGuides = {
  pla: "대부분 하루 안에 완성됩니다.",
  tpu: "제작 속도가 느려 하루가 더 걸릴 수 있습니다.",
  resin: "세척·경화 후처리 때문에 하루가 더 걸립니다."
};

// 방문 날짜는 오늘부터 고를 수 있게 합니다.
function getTodayText() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
visitDate.min = getTodayText();

// 2) 현재 단계만 보여 주는 함수
function showStep(step) {
  printSteps.forEach(function (item) {
    item.hidden = Number(item.dataset.step) !== step;
  });

  flowMarkers.forEach(function (marker) {
    const markerStep = Number(marker.dataset.step);
    marker.classList.toggle("is-current", markerStep === step);
    marker.classList.toggle("is-done", markerStep < step);
  });

  printProgress.textContent = step <= 3
    ? step + " / 3 · " + stepNames[step - 1]
    : "신청 완료";
}

// 3) 오류 표시·해제 함수 (여러 입력창에서 같이 사용)
function showError(input, errorBox, message) {
  errorBox.textContent = message;
  input.classList.add("has-error");
  input.setAttribute("aria-invalid", "true");
}

function clearError(input, errorBox) {
  errorBox.textContent = "";
  input.classList.remove("has-error");
  input.removeAttribute("aria-invalid");
}

// 4) 진입: 안전 수칙 확인 후 시작 버튼을 누르면 1단계 열기
function handleStartClick() {
  printFlow.hidden = false;
  showStep(1);
  modelName.focus();
}

startButton.addEventListener("click", handleStartClick);

// 5) 1단계 · input: 이름 글자 수 표시 + 다시 입력하면 오류 지우기
function handleNameInput() {
  nameCount.textContent = requesterName.value.length + " / 10";
  if (requesterName.value.trim() !== "") {
    clearError(requesterName, nameError);
  }
}

function handleModelInput() {
  if (modelName.value.trim() !== "") {
    clearError(modelName, modelError);
  }
}

requesterName.addEventListener("input", handleNameInput);
purpose.addEventListener("change", function () {
  if (purpose.value !== "") {
    clearError(purpose, purposeError);
  }
});
modelName.addEventListener("input", handleModelInput);

// 6) 1단계 → 2단계: 필수값 검사
function handleNext1() {
  const modelMissing = modelName.value.trim() === "";
  const purposeMissing = purpose.value === "";
  const nameMissing = requesterName.value.trim() === "";

  if (modelMissing) {
    showError(modelName, modelError, "만들 것 이름을 입력해 주세요. 예: 접이식 휴대폰 거치대 시제품");
  } else {
    clearError(modelName, modelError);
  }

  if (purposeMissing) {
    showError(purpose, purposeError, "제작 용도를 골라 주세요.");
  } else {
    clearError(purpose, purposeError);
  }

  if (nameMissing) {
    showError(requesterName, nameError, "신청자 이름을 입력해 주세요.");
  } else {
    clearError(requesterName, nameError);
  }

  if (modelMissing || purposeMissing || nameMissing) {
    // 고쳐야 할 첫 입력창으로 이동하고 현재 단계에 머뭅니다.
    if (modelMissing) {
      modelName.focus();
    } else if (purposeMissing) {
      purpose.focus();
    } else {
      requesterName.focus();
    }
    return;
  }

  showStep(2);
  material.focus();
}

document.querySelector("#printNext1").addEventListener("click", handleNext1);

// 7) 2단계 · change: 재료 안내 / 수령 방법에 따라 날짜 입력 표시
function handleMaterialChange() {
  materialHelp.textContent = materialGuides[material.value];
}

function handlePickupChange() {
  const isVisit = pickup.value === "visit";
  visitDateField.hidden = !isVisit;

  // 사물함을 고르면 숨겨진 날짜는 비우고 검사하지 않습니다.
  if (!isVisit) {
    visitDate.value = "";
    clearError(visitDate, dateError);
  }
}

material.addEventListener("change", handleMaterialChange);
pickup.addEventListener("change", handlePickupChange);
visitDate.addEventListener("change", function () {
  if (visitDate.value !== "") {
    clearError(visitDate, dateError);
  }
});

// 8) 2단계 → 3단계: 직접 수령일 때만 날짜 검사
function handleNext2() {
  if (pickup.value === "visit") {
    if (visitDate.value === "") {
      showError(visitDate, dateError, "결과물을 받으러 올 날짜를 골라 주세요.");
      visitDate.focus();
      return;
    }
    if (visitDate.value < visitDate.min) {
      showError(visitDate, dateError, "오늘 또는 이후 날짜를 골라 주세요.");
      visitDate.focus();
      return;
    }
  }

  clearError(visitDate, dateError);
  showSummary();
  showStep(3);
}

document.querySelector("#printNext2").addEventListener("click", handleNext2);

// 9) 확인 화면: 입력·선택한 값을 그대로 보여 주기
function addSummaryRow(term, value) {
  const dt = document.createElement("dt");
  const dd = document.createElement("dd");
  dt.textContent = term;
  dd.textContent = value;
  printSummary.append(dt, dd);
}

function getPickupText() {
  return pickup.value === "visit"
    ? "직접 수령 · " + visitDate.value + " 방문"
    : "사물함 보관";
}

function showSummary() {
  printSummary.textContent = "";
  addSummaryRow("만들 것", modelName.value.trim());
  addSummaryRow("제작 용도", purpose.options[purpose.selectedIndex].text);
  addSummaryRow("신청자", requesterName.value.trim());
  addSummaryRow("재료", material.options[material.selectedIndex].text);
  addSummaryRow("수령 방법", getPickupText());
}

// 10) 이전 버튼: 값은 그대로 두고 단계만 이동
document.querySelector("#printBack2").addEventListener("click", function () {
  showStep(1);
  modelName.focus();
});

document.querySelector("#printBack3").addEventListener("click", function () {
  showStep(2);
  material.focus();
});

// 11) 신청 → 확인 팝업 → 확정 또는 다시 확인
document.querySelector("#printSubmit").addEventListener("click", function () {
  confirmDialog.showModal();
});

// 다시 확인: 팝업만 닫고 값은 유지 (Esc 키도 같은 결과)
document.querySelector("#confirmCancel").addEventListener("click", function () {
  confirmDialog.close();
});

function handleConfirmOk() {
  confirmDialog.close();

  const ticketNumber = Math.floor(1000 + Math.random() * 9000);
  printTicket.textContent = "NM-" + ticketNumber;

  doneGuide.textContent = pickup.value === "visit"
    ? visitDate.value + "에 학생증을 들고 메이커스페이스로 오세요."
    : "완성되면 사물함 번호와 비밀번호를 이메일로 보내 드립니다.";

  // 제작 용도에 따라 다음 행동을 다르게 안내합니다.
  purposeGuide.textContent = purposeGuides[purpose.value];

  showStep(4);
  doneTitle.focus();
}

document.querySelector("#confirmOk").addEventListener("click", handleConfirmOk);

// 12) 다시 시작: 입력·선택·오류·진행 상태를 모두 처음으로
function handleRestart() {
  modelName.value = "";
  purpose.value = "";
  requesterName.value = "";
  nameCount.textContent = "0 / 10";

  material.value = "pla";
  materialHelp.textContent = materialGuides.pla;
  pickup.value = "locker";
  visitDate.value = "";
  visitDateField.hidden = true;

  clearError(modelName, modelError);
  clearError(purpose, purposeError);
  clearError(requesterName, nameError);
  clearError(visitDate, dateError);

  printSummary.textContent = "";
  printTicket.textContent = "";
  doneGuide.textContent = "";
  purposeGuide.textContent = "";

  showStep(1);
  modelName.focus();
}

document.querySelector("#printRestart").addEventListener("click", handleRestart);
