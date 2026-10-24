// ===== Страница заказа: order.html?product=jacket выбирает товар в списке
// и добавляет его в хлебные крошки (Главная / Каталог / Куртка / Оформление заказа).
// Скрипт подключён в конце <body>, поэтому форма уже есть на странице.

(() => {
    const select = document.getElementById('product');
    const id = new URLSearchParams(window.location.search).get('product');
    const current = document.querySelector('.breadcrumb-item.active');

    if (!select || !id || !current) {
        return;
    }

    // Товар должен быть в списке (пустой пункт «Выберите товар» не считается)
    const option = Array.from(select.options).find((item) => item.value && item.value === id);
    if (!option) {
        return;
    }

    select.value = option.value;

    const crumb = document.createElement('li');
    crumb.className = 'breadcrumb-item';

    const link = document.createElement('a');
    link.href = `product.html?id=${encodeURIComponent(option.value)}`;
    link.textContent = option.textContent;

    crumb.append(link);
    current.before(crumb);
})();
