// ===== Общий интерфейс: тема оформления, кнопка «Наверх», быстрый заказ
// Скрипт подключается в <head>: сохранённая тема применяется до отрисовки страницы.

(() => {
    const root = document.documentElement;

    // Класс js позволяет скрывать кнопку «Наверх» только когда скрипт реально работает
    root.classList.add('js');

    // Тема, которую посетитель выбрал раньше
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('theme');
    } catch (error) {
        // localStorage может быть недоступен (приватный режим), тогда остаётся тема системы
    }
    if (savedTheme !== 'light' && savedTheme !== 'dark') {
        savedTheme = null;
    }

    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

    // Bootstrap 5.3 переключает тему атрибутом data-bs-theme на <html>
    function applyTheme() {
        root.setAttribute('data-bs-theme', savedTheme || (systemDark.matches ? 'dark' : 'light'));
    }

    function isDark() {
        return root.getAttribute('data-bs-theme') === 'dark';
    }

    applyTheme();

    document.addEventListener('DOMContentLoaded', () => {
        // ----- Переключатель темы
        const themeToggle = document.querySelector('.theme-toggle');

        function syncThemeToggle() {
            if (themeToggle) {
                themeToggle.setAttribute('aria-pressed', String(isDark()));
            }
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                savedTheme = isDark() ? 'light' : 'dark';
                try {
                    localStorage.setItem('theme', savedTheme);
                } catch (error) {
                    // без сохранения тема просто действует до закрытия страницы
                }
                applyTheme();
                syncThemeToggle();
            });
        }

        systemDark.addEventListener('change', () => {
            applyTheme();
            syncThemeToggle();
        });
        syncThemeToggle();

        // ----- Кнопка «Наверх»: появляется, когда hero прокручен целиком
        const toTop = document.querySelector('.to-top');
        const hero = document.querySelector('.hero');
        const header = document.querySelector('.site-header');

        function updateToTop() {
            if (!toTop) {
                return;
            }
            let show;
            if (hero && header) {
                // Низ hero ушёл под шапку: первый экран пролистан полностью
                show = hero.getBoundingClientRect().bottom <= header.offsetHeight;
            } else {
                // На страницах без hero кнопка появляется после полуэкрана прокрутки
                show = window.scrollY > window.innerHeight * 0.5;
            }
            toTop.classList.toggle('to-top--visible', show);
        }

        window.addEventListener('scroll', updateToTop, { passive: true });
        window.addEventListener('resize', updateToTop);
        updateToTop();

        // ----- Окно быстрого заказа (Bootstrap modal)
        const orderModal = document.getElementById('orderModal');
        const selectedProductInput = document.getElementById('selected-product');

        if (orderModal && selectedProductInput) {
            // Название товара берём из data-product кнопки, которая открыла окно
            orderModal.addEventListener('show.bs.modal', (event) => {
                const button = event.relatedTarget;
                selectedProductInput.value = (button && button.dataset.product) || '';
            });
        }

        // ----- Отправка формы заказа (окно или страница заказа)
        const orderForm = document.getElementById('orderForm');
        const successMessage = document.getElementById('successMessage');
        let hideTimer = null;

        if (orderForm) {
            orderForm.addEventListener('submit', (event) => {
                event.preventDefault(); // Бэкенда пока нет, поэтому отправку отменяем

                const fields = Array.from(orderForm.elements).filter((element) => element.willValidate);
                fields.forEach((element) => element.classList.remove('is-invalid'));

                if (!orderForm.checkValidity()) {
                    fields.forEach((element) => {
                        if (!element.checkValidity()) {
                            element.classList.add('is-invalid');
                        }
                    });
                    // Стандартное сообщение браузера об ошибке
                    orderForm.reportValidity();
                    return;
                }

                orderForm.reset();

                if (orderModal) {
                    bootstrap.Modal.getInstance(orderModal).hide();
                }

                if (successMessage) {
                    successMessage.hidden = false;
                    clearTimeout(hideTimer);
                    hideTimer = setTimeout(() => {
                        successMessage.hidden = true;
                    }, 6000);
                }
            });
        }
    });
})();
