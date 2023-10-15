var apiUrl = 'https://cb.kgdshop.ru/request/add/';
var recaptcha_v3_sitekey = "6LfnKtwfAAAAAKy1TQQyDNJKhNhcTeuCFibXtHFY";
var recaptcha_v2_sitekey = "6LcwLNwfAAAAAOqzbiDpYb4E0mWIYnTjMzp_JF0d";

var current_recaptcha_version = 3;
var recaptcha_reloaded_time = Date.now();

var jPrivacy = $('<p class="text-muted">Сайт защищен при помощи reCAPTCHA.<br>Применяются <a target="_blank" href="https://policies.google.com/privacy">Политика конфиденциальности</a> и <a target="_blank" href="https://policies.google.com/terms">Условия использования</a> Google.</p>');

$(function () {
  /*
  var typed = new Typed('#typed', {
    stringsElement: '#typed-strings',
    typeSpeed: 50
  });
  */
  $('.popup-phone').mask("+7 (999) 999-9999", { autoclear: false });

  $('.popup-phone').on('click', function () {
    var value = $(this).val();
    if (value == $(this).attr('placeholder'))
      $(this).get(0).setSelectionRange(4, 4);
  });

  $('.js-feedback').magnificPopup({
    type: 'inline',
    preloader: false,
    focus: '.popup-phone',
    callbacks: {
      open: function () {
        if (current_recaptcha_version !== 3) {
          var form = this.content.find("form")[0];
          var jForm = $(form);
          if (jForm) {
            recaptchaV2Reload(jForm);
          }
        }
        $('.x-btn').on('click', function () { $('.mfp-close').click() });
      },
      close: function () {
        var form = this.content.find("form")[0];
        var jForm = $(form);
        jForm[0].reset();
        $('.lds-roller').remove();
        $('.popup-success, .popup-error').remove();
        $('.popup-close').hide();
        $('body>div[style]:last-of-type').has('div iframe[title]').css('visibility', 'hidden');
        jForm.show();
      }
    }
  });

  load_recaptcha_api();
  gready();

});

function load_recaptcha_api() {
  $.getScript("https://www.google.com/recaptcha/api.js?render=" + recaptcha_v3_sitekey);
}

function gready() {

  $('form').each(function (i, form) {

    initForm(
      form,
      function (notice) { /* callbackSuccess */
        var jForm = $(form);
        if (window['processNotice'] && typeof (processNotice) === 'function') {
          var site_id = jForm.find("input[name=site_id]").val();
          var form_id = jForm.find("input[name=form_id]").val();
          processNotice(site_id, form_id, notice);
        }
        var jPopup = jForm.closest('.popup');
        jForm.hide();
        var jMessage = $('<div class="popup-success">' + notice.message + '</div>');
        jPopup.find('.popup_header').after(jMessage);
        $('.lds-roller').remove();
        jMessage.show();

        jPopup.find('.popup-close').show().on('click', function () {
          phoneBorder();
          $('.mfp-close').click();
        });

      },
      function (errors) { /* callbackFail */
        $(form).find('.popup-success, .popup-error').remove();
        $.each(errors, function (i, notice) {
          var jForm = $(form);
          if (window['processNotice'] && typeof (processNotice) === 'function') {
            var site_id = jForm.find("input[name=site_id]").val();
            var form_id = jForm.find("input[name=form_id]").val();
            processNotice(site_id, form_id, notice);
          }
          var field = notice.field;
          var message = notice.message;
          var jMessage;
          var jInput = (field ? jForm.find('[name=' + field + ']') : null);
          if (!jInput) {
            var jPopup = jForm.closest('.popup');
            jForm.hide();

            jMessage = $('<div class="popup-error">' + message + '</div>');
            jPopup.find('.popup_header').after(jMessage);
            $('.lds-roller').remove();
            jMessage.show();
            jPopup.find('.popup-close').show().on('click', function () {
              phoneBorder();
              $('.mfp-close').click();
            });
            return false;
          }
          jMessage = $('<div class="popup-error">' + message + '</div>');
          jMessage.insertAfter(jInput);
          jMessage.show();

        });
      }
    );
  });
}

function initForm(form, callbackSuccess, callbackFail, parentClass = null) {

  var jForm = $(form);
  var jPopup = $(form).closest('.popup');
  var parent = jForm;
  if (parentClass) {
    parent = jForm.closest(parentClass);
  }
  jPrivacy.clone().insertAfter(parent.find('.recaptcha-container'));
  jForm.on('submit', function (e) {

    e.preventDefault();
    $('.r-error').remove();
    $('.popup-error').remove();
    $(this).hide();
    jPopup.append('<div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>');
    $('.popup-close').hide();
    $('.x-btn').hide();


    if (current_recaptcha_version === 3) {
      sendDataWithRecaptchaV3(jForm, sendData);
    } else {
      sendDataWithRecaptchaV2(jForm, sendData);
    }
    phoneBorder();
  });

  function sendData() {
    $.ajax({
      method: 'POST',
      url: apiUrl,
      data: $(jForm).serialize()
    }).done(function (response) {
      // success
      if (response.status === 'success') {
        callbackSuccess(response.notice);
        return;
      }
      // error - recaptcha
      if (isInvalidRecaptcha(response.errors)) {
        if (current_recaptcha_version === 3) {
          current_recaptcha_version = 2;
        }
        if (current_recaptcha_version === 2) {
          recaptchaV2Reload(jForm);
          $('.r-error').remove();
          var jMessage = $('<div class="popup-error">Пожалуйста, подтвердите, что вы не робот</div>');
          $('.recaptcha-container').append(jMessage);
          $('.popup-error').show();
        }

        $('form').show();
        $('.popup-close').hide();
        $('.lds-roller').remove();

        return;
      }
      // error
      $('form').show();
      $('.popup-close').hide();
      $('.lds-roller').remove();
      phoneBorder('red');
      callbackFail(response.errors);
    });
    $('.x-btn').show();
  }
}

function isInvalidRecaptcha(errors) {
  if (!errors) {
    return false;
  }
  for (var i = 0; i < errors.length; i++) {
    var error = errors[i];
    if (error.id === 'RECAPTCHA_IS_FAILED') {
      return true;
    }
  }
  return false;
}

function sendDataWithRecaptchaV3(jForm, sendData) {

  console.log("recaptcha v3: отправка на сайт");

  if (Date.now() - recaptcha_reloaded_time > 3600000 /* ms */) {
    console.log("recaptcha v3: перезагрузка recaptcha api");
    load_recaptcha_api();
    recaptcha_reloaded_time = Date.now();
    console.log("recaptcha v3: после перезагрузки recaptcha api");
  }

  grecaptcha.ready(function () {
    grecaptcha.execute(recaptcha_v3_sitekey, { action: 'homepage' }).then(function (recaptcha_response) {
      jForm.find('[name=recaptcha_version]').val(3);
      jForm.find('[name=recaptcha_response]').val(recaptcha_response);
      sendData();
      console.log("recaptcha v3: отправлен запрос в крм");
    });
  });

  console.log("recaptcha v3: отправка успешно");

}

function sendDataWithRecaptchaV2(jForm, sendData) {
  var container = jForm.find('.recaptcha-container')[0];
  var opt_widget_id = container.opt_widget_id;
  var recaptcha_response = grecaptcha.getResponse(opt_widget_id);
  jForm.find('[name=recaptcha_version]').val(2);
  jForm.find('[name=recaptcha_response]').val(recaptcha_response);
  sendData();
}

function recaptchaV2Reload(jForm) {
  var container = jForm.find('.recaptcha-container')[0];
  if (!container)
    return;
  var opt_widget_id = container.opt_widget_id;
  if (opt_widget_id !== undefined) {
    grecaptcha.reset(opt_widget_id);
    return;
  }
  opt_widget_id = grecaptcha.render(container, {
    sitekey: recaptcha_v2_sitekey
  });

  container.opt_widget_id = opt_widget_id;

}

/*
 * Обработка сообщения перед выводом в форму
 * notice {object} имеет поля:
 *	id {string} Идентификатор
 *	message {string} Строка сообщения
 *	field {string} Имя поля формы, равно null, если нет

function processNotice(site_id, form_id, notice) {

  var id = notice.id;
  var new_msg;

  if( new_msg = _msgs[form_id] && _msgs[form_id][id] ) {
    notice.message = new_msg;
  } else if ( new_msg = _msgs[null] && _msgs[null][id] ) {
    notice.message = new_msg;
  }
}
var _msgs = {
  null: {
    'WAIT_FOR_CONTACT': "",
    'REQUEST_ALREADY_EXIST': "",
    'FIELD_IS_REQUIRED': ""
  },
  1002: {
    'WAIT_FOR_CONTACT': "",
    'REQUEST_ALREADY_EXIST': "",
    'FIELD_IS_REQUIRED': ""
  }
}
*/
$(function () {
  $('.menu-item.dropdown').hover(function () {
    $(this).children('.dropdown-menu').fadeIn(100);
  }, function () {
    $(this).children('.dropdown-menu').fadeOut(100);
  });
  $('.menu-item.dropdown').hover(function () {
    $(this).children('.dropdown-menu').fadeIn(100);
  }, function () {
    $(this).children('.dropdown-menu').fadeOut(100);
  });
});

function phoneBorder(red) {
  if (red === 'red')
    $('.popup-phone').css('border', '1px solid #cf3434');
  else
    $('.popup-phone').css('border', '1px solid #282121');
}


const showHelpingPopup = () => {
  var dispatchMouseEvent = function (target, var_args) {
    var e = document.createEvent("MouseEvents");
    e.initEvent.apply(e, Array.prototype.slice.call(arguments, 1));
    target.dispatchEvent(e);
  };
  dispatchMouseEvent(document.querySelector('.js-feedback2.hidden'), 'click', true, true);
}

$('.js-feedback2').magnificPopup({
  type: 'inline',
  preloader: false,
  callbacks: {
    open: function () {
      $('.x-btn').on('click', function () { $('.mfp-close').click() });
    },
    close: function () {
      $('.popup-success, .popup-error').remove();
      $('.popup-close').hide();
      $('body>div[style]:last-of-type').has('div iframe[title]').css('visibility', 'hidden');
    }
  }
});

const body = document.querySelector('body');
var sections = $("section"),
  nav = $(".header"),
  nav_height = nav.outerHeight();
nav.find("a[href^='#']").on("click", function () {

  var $el = $(this),
    id = $el.attr("href");


  if (!document.querySelector('.protection ' + id)) {
    $("html, body").animate(
      {
        scrollTop: $(id).offset().top - nav_height,
      }, 0
    );
  } else if (document.querySelector('.showcase__btn--active')) {
    const num = document.querySelector('.showcase__btn--active').getAttribute('data-content');
    $("html, body").animate(
      {
        scrollTop: $($('.type ' + id)[num-1]).offset().top - nav_height,
      }, 0
    );
  } else {
    body.classList.add('blocked')
    showHelpingPopup();
  }



  return false;
});

if (document.querySelector('body').classList.contains('protection')) {
  const body = document.querySelector('body');
  window.addEventListener('scroll', () => {
    const btns = document.querySelectorAll('.showcase__block-btns .showcase__btn');
    if (window.pageYOffset + document.documentElement.clientHeight + 60 >= document.body.scrollHeight) {
      if (!document.querySelector('.showcase__btn--active')) {
        if (!body.classList.contains('blocked')) {
          body.classList.add('blocked')
          showHelpingPopup();
        }
      }
    } else {
      body.classList.remove('blocked')
    }
  });
}
