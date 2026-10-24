// ===== Страница товара: один файл product.html для всех 20 товаров
// Товар выбирается по параметру ?id=... из данных js/products.js.
// Скрипт подключён в конце <body>, поэтому разметка страницы уже готова.

(() => {
    const root = document.getElementById('productRoot');
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const SITE_NAME = 'Учебный интернет-магазин';

    if (!root) {
        return;
    }

    // Хлебные крошки: Главная / Каталог / текущая страница
    function breadcrumbs(current) {
        return `
    <nav aria-label="Хлебные крошки">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="index.html">Главная</a></li>
        <li class="breadcrumb-item"><a href="catalog.html">Каталог</a></li>
        <li class="breadcrumb-item active" aria-current="page">${current}</li>
      </ol>
    </nav>`;
    }

    // Бейдж «Скидка» или «Новинка»
    function badge(type, extraClass) {
        if (type === 'sale') {
            return `<span class="badge badge-sale ${extraClass}">Скидка</span>`;
        }
        if (type === 'new') {
            return `<span class="badge badge-new ${extraClass}">Новинка</span>`;
        }
        return '';
    }

    // Карточка товара, как в каталоге
    function card(cardId) {
        const item = PRODUCTS[cardId];
        return `
        <div class="col-12 col-md-4">
          <article class="card product-card${item.badge === 'sale' ? ' product-card--discount' : ''} h-100 p-3 gap-2">
            ${badge(item.badge, 'position-absolute top-0 start-0 m-3 z-1')}
            <a class="ratio ratio-1x1" href="product.html?id=${cardId}"><img class="product-card__image object-fit-cover" src="${item.image}" alt="${item.title}" loading="lazy"></a>
            <h3 class="product-card__title m-0">${item.title}</h3>
            <p class="text-body-secondary m-0">${item.summary}</p>
            <p class="product-card__price fw-bold m-0">Цена: ${item.price}</p>
            <a class="btn btn-primary align-self-start mt-auto" href="product.html?id=${cardId}">Подробнее</a>
          </article>
        </div>`;
    }

    // Таблица характеристик
    function specsTable(item) {
        const rows = item.specs
            .map(([name, value]) => `
            <tr>
              <th scope="row">${name}</th>
              <td>${value}</td>
            </tr>`)
            .join('');
        return `
    <section class="section">
      <h2 class="section-title">Характеристики</h2>
      <div class="table-responsive">
        <table class="table table-bordered product-table">
          <caption class="caption-top">${item.specsCaption}</caption>
          <thead>
            <tr>
              <th scope="col">Параметр</th>
              <th scope="col">Значение</th>
            </tr>
          </thead>
          <tbody>${rows}
          </tbody>
        </table>
      </div>
    </section>`;
    }

    // Значение характеристики по её названию
    function spec(item, name) {
        const found = item.specs.find((row) => row[0] === name);
        return found ? found[1] : '';
    }

    // Сравнение верхней одежды (только на страницах Куртки и Пальто)
    function compareTable(currentId) {
        const head = COMPARE_IDS
            .map((cmpId) => {
                const item = PRODUCTS[cmpId];
                if (cmpId === currentId) {
                    return `<th class="compare-current" scope="col" aria-current="true">${item.name} (эта модель)</th>`;
                }
                return `<th scope="col"><a href="product.html?id=${cmpId}">${item.name}</a></th>`;
            })
            .join('\n              ');

        const cells = (label, getValue) => `
            <tr>
              <th scope="row">${label}</th>
              ${COMPARE_IDS
                  .map((cmpId) => `<td${cmpId === currentId ? ' class="compare-current"' : ''}>${getValue(PRODUCTS[cmpId])}</td>`)
                  .join('\n              ')}
            </tr>`;

        const rows = cells('Цена', (item) => item.price)
            + COMPARE_ROWS.map((label) => cells(label, (item) => spec(item, label))).join('');

        const caption = 'Куртка, пальто и пуховик: основные характеристики';

        return `
    <section class="section" id="compare">
      <h2 class="section-title">Сравнение верхней одежды</h2>
      <div class="table-responsive">
        <table class="table table-bordered product-table">
          <caption class="caption-top">${caption}</caption>
          <thead>
            <tr>
              <th scope="col">Параметр</th>
              ${head}
            </tr>
          </thead>
          <tbody>${rows}
          </tbody>
        </table>
      </div>
    </section>`;
    }

    // Таблица размеров в Bootstrap accordion (в КР1 был details)
    function sizeGuide(sizeKey) {
        const table = SIZE_TABLES[sizeKey];
        const rows = table.rows
            .map((row) => `
              <tr>
                <th scope="row">${row[0]}</th>
                ${row.slice(1).map((cell) => `<td>${cell}</td>`).join('\n                ')}
              </tr>`)
            .join('');
        return `
    <div class="accordion section" id="sizeGuide">
      <div class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sizeGuideBody" aria-expanded="false" aria-controls="sizeGuideBody">Таблица размеров</button>
        </h2>
        <div id="sizeGuideBody" class="accordion-collapse collapse">
          <div class="accordion-body">
            <div class="table-responsive">
              <table class="table table-bordered product-table">
                <caption class="caption-top">${table.caption}</caption>
                <thead>
                  <tr>
                    ${table.head.map((name) => `<th scope="col">${name}</th>`).join('\n                    ')}
                  </tr>
                </thead>
                <tbody>${rows}
                </tbody>
              </table>
            </div>
            <p class="small mt-3 mb-0"><a href="size.html#size-${sizeKey}">Как снять мерки и выбрать размер</a></p>
          </div>
        </div>
      </div>
    </div>`;
    }

    // Товара с таким id нет
    if (!id || !Object.hasOwn(PRODUCTS, id)) {
        document.title = `Товар не найден - ${SITE_NAME}`;
        root.innerHTML = `${breadcrumbs('Товар не найден')}
    <section class="section">
      <h1 class="section-title">Товар не найден</h1>
      <div class="alert alert-warning" role="alert">
        Такого товара нет. Откройте <a class="alert-link" href="catalog.html">каталог</a> и выберите товар из списка.
      </div>
    </section>`;
        return;
    }

    const product = PRODUCTS[id];
    document.title = `${product.name} - ${SITE_NAME}`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', product.meta);
    }

    root.innerHTML = `${breadcrumbs(product.name)}
    <section class="row g-4 section">
      <div class="col-md-6">
        <div class="position-relative">
          ${badge(product.badge, 'position-absolute top-0 start-0 m-3 z-1')}
          <div class="ratio ratio-1x1">
            <img class="product-image object-fit-cover" src="${product.image}" alt="${product.imageAlt}">
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <h1 class="product-title">${product.name}</h1>
        <p class="product-price">${product.price}</p>
        <p>${product.description}</p>
        <a class="btn btn-primary" href="order.html?product=${id}">Оформить заказ</a>
      </div>
    </section>
${specsTable(product)}
${COMPARE_IDS.includes(id) ? compareTable(id) : ''}
${product.sizes ? sizeGuide(product.sizes) : ''}
    <section class="section">
      <h2 class="section-title">Похожие товары</h2>
      <div class="row g-4">${product.related.map(card).join('')}
      </div>
    </section>`;
})();
