/**
 * 채무조정/회생 상담 신청 스크립트 (Supabase 전송)
 *
 * 기존 Google Forms 전송 → Supabase REST API로 변경
 * 버튼그룹 선택, 유효성 검사, UI 로직 모두 그대로 유지
 *
 * ★ 설정: 아래 두 줄만 본인 값으로 변경하세요
 */

var SUPABASE_URL  = 'https://yiuioprceyuybwkgxmrm.supabase.co';
var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpdWlvcHJjZXl1eWJ3a2d4bXJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NDM1MDIsImV4cCI6MjA5NDMxOTUwMn0.SkkBCH9avPMZu-LeBtdOh5zsppcRMvbnilj38CkHEZs';

$(document).ready(function () {
  form_c();

  $('#send_message').click(function (e) {
    e.preventDefault();

    var error = false;

    $('#send_message').attr({ disabled: 'true', value: '잠시만 기다려주세요' });
    const messages = ['정보를 확인 중입니다', '전송 준비 중입니다', '곧 신청이 완료됩니다.'];
    let msgIndex = 0;

    const msgInterval = setInterval(function () {
      msgIndex++;
      if (msgIndex < messages.length) {
        $('#send_message').val(messages[msgIndex]);
      } else {
        clearInterval(msgInterval);
      }
    }, 1000);

    $('#send_message').prop('disabled', false);
    $('#send_message').css({ transition: '1s', background: '#222222', color: '#fff' });

    // Supabase 전송
    submitRecoveryToSupabase();
  });

  $('#name,#phone,.intro_select,.intro_select1,.intro_select2,.intro_select3,.intro_select4,.intro_select5,#location,#message,#agree11').bind('keyup click change', form_c);
});

// ================================================================
//  Supabase 전송
// ================================================================
function submitRecoveryToSupabase() {
  var payload = {
    job_type:     getSelectedValue('intro_select1') || '',
    income:       getSelectedValue('intro_select2') || '',
    debt_amount:  getSelectedValue('intro_select') || '',
    family_count: getSelectedValue('intro_select3') || '',
    recent_loan:  getSelectedValue('intro_select4') || '',
<<<<<<< HEAD
    debt_reason:  getSelectedValues('intro_select5') || null,
=======
    debt_reason:  getSelectedValue('intro_select5') || null,
>>>>>>> 2f9c41a57ac86a392bbacc7131a0a0918fa16432
    name:         $.trim($('#name').val() || ''),
    location:     $('#location').val() || '',
    phone:        String($('#phone').val() || '').replace(/[^0-9]/g, ''),
    message:      $.trim($('#message').val() || '') || null,
    source:       '모비온'
  };

  fetch(SUPABASE_URL + '/rest/v1/recovery_consultations', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_ANON,
      'Authorization': 'Bearer ' + SUPABASE_ANON,
      'Prefer':        'return=minimal'
    },
    body: JSON.stringify(payload)
  })
  .then(function (res) {
    if (!res.ok) throw new Error('저장 실패');

    try {
      if (window.karrotPixel && window.karrotPixel.track) {
        window.karrotPixel.track('SubmitApplication');
      }
    } catch (err) {}

    setTimeout(function () {
      alert('신청이 완료되었습니다.');
      window.location.href = './thanks.html';
    }, 1500);
  })
  .catch(function (err) {
    alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    $('#send_message').prop('disabled', false).val('무료 상담 신청하기');
    $('#send_message').css({ background: '#dcbe4e', color: '#000', cursor: 'pointer' });
  });
}

// ================================================================
<<<<<<< HEAD
//  선택값 가져오기
// ================================================================

// 단일 선택용 (radio)
=======
//  유효성 검사 (기존 로직 그대로)
// ================================================================
>>>>>>> 2f9c41a57ac86a392bbacc7131a0a0918fa16432
function getSelectedValue(className) {
  var selected = $('.' + className + '.active').data('value');
  return selected || null;
}

<<<<<<< HEAD
// 다중 선택용 (checkbox) — 채무원인
function getSelectedValues(className) {
  var values = [];
  $('.' + className + '.active').each(function () {
    values.push($(this).data('value'));
  });
  return values.length > 0 ? values : null;
}

// ================================================================
//  유효성 검사
// ================================================================
=======
>>>>>>> 2f9c41a57ac86a392bbacc7131a0a0918fa16432
function form_c() {
  const regex1 = /^[가-힣]+$/;
  const regex = /^[0-9]+$/;

  var position  = getSelectedValue('intro_select');
  var position1 = getSelectedValue('intro_select1');
  var position2 = getSelectedValue('intro_select2');
  var position3 = getSelectedValue('intro_select3');
  var position4 = getSelectedValue('intro_select4');
  var position5 = getSelectedValue('intro_select5');

  var location = $('#location').val();
  var name = $('#name').val();
  var phone = $('#phone').val();
  var agree = $('#agree11').is(':checked');

  function disableButton(message) {
    $('#send_message').css({ transition: '1s', background: '#000', color: '#fff' });
    $('#send_message').prop('disabled', true).val(message).css('cursor', 'default');
  }

  function enableButton() {
    $('#send_message').css({ transition: '1s', background: '#dcbe4e', color: '#000' });
    $('#send_message').prop('disabled', false).val('무료 상담 신청하기').css('cursor', 'pointer');
  }

  if (!position1) return disableButton('직업종류 선택을 확인하세요');
  if (!position2) return disableButton('월평균 수입 선택을 확인하세요');
  if (!position)  return disableButton('채무 금액 선택을 확인하세요');
  if (!position3) return disableButton('부양가족 선택을 확인하세요');
  if (!position4) return disableButton('대출유무 선택을 확인하세요');
  if (!position5) return disableButton('채무원인 선택을 확인하세요');

  if (!regex1.test(name) || name.length <= 1) return disableButton('성함 입력을 확인하세요');
  if (!location || location.length <= 1) return disableButton('거주지 선택을 확인하세요');
  if (!(phone.substr(0, 3) == '010' && phone.length == 11 && regex.test(phone))) return disableButton('전화번호 입력을 확인하세요');
  if (!agree) return disableButton('개인 정보 동의를 확인하세요');

  enableButton();
}

// ================================================================
<<<<<<< HEAD
//  전역 유틸
=======
//  전역 유틸 (기존 로직 그대로)
>>>>>>> 2f9c41a57ac86a392bbacc7131a0a0918fa16432
// ================================================================
function dll() {}

function maxLengthCheck(object) {
  if (object.value.length > object.maxLength) {
    object.value = object.value.slice(0, object.maxLength);
  }
}

function hoa3() {
  setTimeout(function () {
    alert('신청이 완료되었습니다.');
    window.location.href = './thanks.html';
  }, 1500);
}

function site1111() {
  window.location.reload();
}