jQuery(function ($) {
  // masked inputs phone
  $('.masked').mask('+7 (999) 999 99 99');

});


(function () {
  // slider team
  document.addEventListener('DOMContentLoaded', function () {
    new Swiper(".team-slider", {
      slidesPerView: 4,
      allowTouchMove: true, // on swipe
      loop: true,
      spaceBetween: 40,
      navigation: {
        nextEl: ".slider-arrow__next",
        prevEl: ".slider-arrow__prev",
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 10
        },
        400: {
          slidesPerView: 2,
          spaceBetween: 10
        },
        640: {
          slidesPerView: 3,
          spaceBetween: 10
        },
        860: {
          slidesPerView: 4,
          spaceBetween: 15
        }
      },
    });
  });

  // fix header
  (function fixHeader() {
    let header = document.querySelector('.header');

    function fixed() {
      if (window.scrollY > 200 && !header.classList.contains('fixed')) {
        header.classList.add('fixed');
      } else if (window.scrollY < 200 && header.classList.contains('fixed')) {
        header.classList.remove('fixed');
      }
    }

    window.addEventListener('scroll', fixed);
    document.addEventListener('DOMContentLoaded', fixed);
  })();


  // lazy scroll
  (function lazyScroll() {
    let links = document.querySelectorAll('.link-anchor');
    let menuLink = document.querySelectorAll('.menu__link');

    for (let i = 0; i < menuLink.length; i++) {
      menuLink[i].addEventListener('click', function (e) {
        for (let x = 0; x < menuLink.length; x++) {
          menuLink[x].classList.remove('active');
        }

        e.target.classList.add('active');
      })
    }

    for (let link of links) {
      link.addEventListener('click', function (e) {
        e.preventDefault();

        const blockID = link.getAttribute('href').substr(1);

        document.getElementById(blockID).scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      })
    }
  })();


  (function popup() {
    let popup = document.querySelector('#popup');
    let body = document.querySelector('body');
    let buttonsOpenPopup = document.querySelectorAll('.open-popup');
    let openQuiz = document.querySelector('#open-quiz');
    let buttonsOpenForm = document.querySelectorAll('.open-form');
    let openSelectSpecialist = document.querySelector('#select-specialist');


    function changeVisiblePopup() {
      popup.classList.toggle('hide');
      body.classList.toggle('fix');
    }


    for (let i = 0; i < buttonsOpenPopup.length; i++) {
      buttonsOpenPopup[i].addEventListener('click', changeVisiblePopup);
    }

    window.addEventListener('click', function (event) {
      if (event.target.classList.contains('popup') || event.target.closest('.close')) {
        changeVisiblePopup();

        if (popup.classList.contains('quiz')) {
          let items = document.querySelectorAll('.quiz-slide');
          let prev = document.querySelector('#quiz-prev');
          let next = document.querySelector('#quiz-next');
          let inputs = document.querySelectorAll('.quiz-slides input');
          let currentSlide = document.querySelector("#progress-value");

          for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].type === "radio") {
              inputs[i].checked = false;
            } else {
              inputs[i].value = '';
            }
          }


          for (let i = 0; i < items.length; i++) {
            items[i].classList.add('hide');
          }

          items[0].classList.remove('hide');

          prev.classList.add('hide');
          next.classList.add('hide');
          next.type = 'button';

          currentSlide.innerHTML = 1;
        }

        popup.classList.remove('quiz', 'selection', 'feedback');
      }
    })

    openQuiz.addEventListener('click', function () {
      popup.classList.add('quiz');

      let items = document.querySelectorAll('.quiz-slide');
      let prev = document.querySelector('#quiz-prev');
      let next = document.querySelector('#quiz-next');
      let progress = document.querySelector('.progress-color');
      let value = document.querySelector("#progress-value");

      let currentSlide = 1;

      function validation() {
        let inputs = document.getElementsByName(`steep-${currentSlide}`);

        if (inputs[0].type !== "radio") {
          next.classList.add('disable');
          next.classList.remove('hide');

          window.addEventListener('click', function (event) {
            if (event.target.classList.contains('quiz-nav__next')) {
              if (inputs[0].value !== '') {
                next.type = 'submit';
                next.classList.remove('disable');
              }
            }
          })
        } else {
          for (let i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener('change', function () {
              next.classList.remove('hide');
            })
          }
        }
      }

      validation();

      next.addEventListener('click', function () {
        setTimeout(function () {
          if (!next.classList.contains('disable')) {
            if (currentSlide < items.length) {
              for (let i = 0; i < items.length; i++) {
                items[i].classList.add('hide');
              }

              items[currentSlide].classList.remove('hide');
              next.classList.add('hide');

              currentSlide++;

              if (currentSlide < items.length) {
                validation();
                value.innerHTML = currentSlide;
              }

              progress.style.width = 100 / items.length * currentSlide + "%";

              if (currentSlide > 1 && currentSlide !== items.length) {
                prev.classList.remove('hide');
              } else {
                prev.classList.add('hide');
              }

            }
          }
        }, 50);
      })

      prev.addEventListener('click', function () {
        next.classList.remove('hide', 'disable');

        if (currentSlide >= 1) {

          for (let i = 0; i < items.length; i++) {
            items[i].classList.add('hide');
          }

          let inputs = document.getElementsByName(`steep-${currentSlide}`);

          if (inputs[0].type === "radio") {
            for (let i = 0; i < inputs.length; i++) {
              inputs[i].checked = false;
            }
          }

          currentSlide = currentSlide - 1;
          value.innerHTML = currentSlide;
          progress.style.width = 100 / items.length * currentSlide + "%";
          items[currentSlide - 1].classList.remove('hide');

          if (currentSlide === 1) {
            prev.classList.add('hide');
          }
        }
      })
    })

    for (let i = 0; i < buttonsOpenForm.length; i++) {
      buttonsOpenForm[i].addEventListener('click', function () {
        popup.classList.add('feedback');
      })
    }

    openSelectSpecialist.addEventListener('click', function () {
      popup.classList.add('selection');
    })
  })()

  let map_container = document.getElementById('map');
  let options_map = {
    once: true,
    passive: true,
    capture: true
  };

  document.addEventListener('DOMContentLoaded', start_lazy_map, options_map);

  let map_loaded = false;
  function start_lazy_map() {
    if (!map_loaded) {

     setTimeout(
       function init() {
         var myMap = new ymaps.Map('map', {
           center: [82.993774, 55.031061],
           zoom: 18,
           controls: ['zoomControl']
         }, {
           searchControlProvider: 'yandex#search',

         });

         var placemarks = [];

         for (var i = 0, l = groups.length; i < l; i++) {
           createMenuGroup(groups[i]);
         }

         function createMenuGroup(group) {
           var collection = new ymaps.GeoObjectCollection(null);


           myMap.geoObjects.add(collection);

           for (var j = 0, m = group.items.length; j < m; j++) {
             createSubMenu(group.items[j], collection, j);
           }
         }

         function createSubMenu(item, collection, j) {
           var placemark = new ymaps.Placemark(item.center, {balloonContent: item.name});

           collection.add(placemark);

           placemarks[item.id] = placemark;
         }

         // куда скакать
         function clickGoto() {
           var pos = [parseFloat(this.getAttribute('data-n')), parseFloat(this.getAttribute('data-s'))];

           myMap.panTo(pos, {flying: 1}).then(function () {
             return false;
           });

           return false;
         }

         var col = document.getElementsByClassName('office-list__location');
         for (var i = 0, n = col.length; i < n; ++i) {
           col[i].onclick = clickGoto;
         }

         for (let i = 0; i < col.length; i++) {
           col[i].setAttribute('data-n', groups[i].items[0].center[0]);
           col[i].setAttribute('data-s', groups[i].items[0].center[1]);
           col[i].setAttribute('data-key', groups[i].items[0].id);

           myPlacemark = new ymaps.Placemark([groups[i].items[0].center[0], groups[i].items[0].center[1]], {
             balloonContent: "",
           }, {
             iconLayout: 'default#image',
             iconImageHref: 'img/location.svg',
             iconImageSize: [49, 50],
             iconImageOffset: [-24, -42],
             balloonLayout: "default#imageWithContent",
           })

           myMap.geoObjects.add(myPlacemark);
         }

         myMap.setBounds(myMap.geoObjects.getBounds());
         myMap.behaviors.disable('scrollZoom');
       }
       , 500)
    }


  }




  var groups = [
    {
      name: "Москва и Московская область",

      items: [
        {
          id: 1,
          center: [55.76552356897194,37.6600175],
          name: "г. Москва, ул. Старая Басманная, 15, стр. 2"
        }
      ]
    }, {
      name: "Калининград",
      style: "islands#blackIcon",
      items: [
        {
          id: 2,
          center: [54.71539956994665,20.487544499999895],
          name: "г. Калининград, ул. Дмитрия Донского, 17-7"
        }
      ]
    }, {
      name: "Астана",
      style: "islands#blackIcon",
      items: [
        {
          id: 3,
          center: [51.15604499427717,71.47593868518064],
          name: "РК, Астана, ул. Кажымукана, 28"
        }
      ]
    }, {
      name: "Санкт-Петербург",
      style: "islands#blackIcon",
      items: [
        {
          id: 4,
          center: [59.91047356419377,30.35825949999997],
          name: "г. Санкт-Петербург, ул. Днепропетровская, дом 14, офис 26"
        }
      ]
    }, {
      name: "Мурманск",
      style: "islands#blackIcon",
      items: [
        {
          id: 5,
          center: [68.90722154952604,33.07303149999997],
          name: "г. Мурманск, ул. Баумана, д. 47 пом. 50"
        }
      ]
    }, {
      name: "New York",
      style: "islands#blackIcon",
      items: [
        {
          id: 6,
          center: [40.710881073934246,-74.008639],
          name: "225 Broadway Suite 2812 New York, NY 10007"
        }
      ]
    }, {
      name: "Грозный",
      style: "islands#blackIcon",
      items: [
        {
          id: 7,
          center: [43.295286574523594,45.70879700000001],
          name: "г. Грозный, ул. Абдаллы 2 Бен Аль-Хусейна (П. Мусорова), 21а"
        }
      ]
    }, {
      name: "Ростов-на-Дону",
      style: "islands#blackIcon",
      items: [
        {
          id: 8,
          center: [47.266905574261536,39.723816499999884],
          name: "г. Ростов-на-Дону, пр. Нагибина 40 офис 212"
        }
      ]
    },
  ];
})();