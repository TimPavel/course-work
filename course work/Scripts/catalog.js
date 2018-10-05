"use strict";

// находим родительский элемент товаров в каталоге
var catalog = document.getElementById('catalog-products');
// находим родительский элемент товаров в маленькой корзине
var cartFocused = document.getElementById('cartFocused');
// находим родительский элемент страниц
var pages = document.getElementById('pages');
// находим header
var header = document.getElementById('header');
// создаем элемент для залогиненного пользователя в header е
var userNameHeader = document.createElement('div');

var selectQuantity = document.getElementById('selectQuantity');

// выбор лимита количества товаров на страницу
var limitNum = +selectQuantity.options[selectQuantity.selectedIndex].value;
// url массива товаров помещенных в корзину
var urlCart = 'http://localhost:3000/cart';
// url массива товаров всего каталога
var urlProducts = 'http://localhost:3000/products';
// url массива товаров для первой страницы (используется при первоначальной загрузке страницы)
var urlProductsLimit = 'http://localhost:3000/products?_page=1&_limit=' + limitNum;
// url массива залогиненного пользователя
var urlLoggedUser = 'http://localhost:3000/userLoggedIn';

// при изменении количества товаров для показа автоматически рендерится каталог, с указанным лимитом
selectQuantity.addEventListener('change', function () {
	// устанавливаем лимит товаров
	limitNum = +selectQuantity.options[selectQuantity.selectedIndex].value;
	// устанавливаем selected
	selectQuantity.options[selectQuantity.selectedIndex].selected = true;
	// устанавливаем url с учетом указанного лимита
	urlProductsLimit = 'http://localhost:3000/products?_page=1&_limit=' + limitNum;

	// вызов функции для запроса данных с сервера с учетом лимита товаров для отображения
	getDataFromServer(urlProductsLimit, function(response) {
		while (catalog.firstChild) {
			catalog.removeChild(catalog.firstChild);
		}
		// TODO automatic pagination

		// вызов функции для отрисовывания товаров в каталоге.
		renderCatalog(response);
		// вызов функции для выбора товара в каталоге.
		selectItem();
	})
});

// функция запрашивает данные на сервере с массива userLoggedIn
getDataFromServer(urlLoggedUser, function (response) {
	// если массив пустой, то выходим
	if(!response.length) {
		return;
	}
	console.log(response);
	// функция для отображения в DOM залогиненного пользователя
	addUserLogged(response[0]);

});

// вызов функции для запроса методом GET
getDataFromServer(urlProductsLimit, function(response) {
	// вызов функции для отрисовывания товаров в каталоге.
	renderCatalog(response);
	// вызов функции для выбора товара в каталоге.
	selectItem();
	// вызов функции для отрисовывания товаров в маленькой корзине.
	renderFocusedCart();
	// вызов функции для расчета суммы в маленькой корзине.
	calculateSmallCart();
});

 /**
 * функция запрашивает данные с сервера методом GET.
 * @param url - адресс на который отправляется запрос.
 * @param callback - функция которая выполняется после получения ответа
 */
function getDataFromServer(url, callback) {
	 var responseCart = null;
  // создаем запрос
  var xhr = new XMLHttpRequest();
  // отправляем созанный запрос методом GET на массив CART - 'http://localhost:3000/cart'.
  xhr.open('GET', url);
  xhr.send();

  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      //полученный ответ парсим из строки в объект.
      responseCart = JSON.parse(xhr.responseText);

			callback(responseCart);
    }    
  }
}

// функция отрисовывает "маленькую корзину" при загрузке страницы.
function renderFocusedCart() {
	// запускаем цикл для удаления товаров из маленькой корзины "костыль :( "
	for(var j = 0; j < cartFocused.children.length; j++) {
		if(cartFocused.children[j].hasAttribute('data-id')) {
			cartFocused.children[j].remove();
			j--;
		}
	}
	getDataFromServer(urlCart, function(responseCart) {
		if (!responseCart.length) { // массив пустой, то выходим из функции
			return;
		}
		// полученный массив перебираем и отрисовываем в "маленькой корзине".
		responseCart.forEach(function(item) {
			// вызываем функция для добавления товара в маленькую корзину.
			addSmallCart(item);

		});
// вызов функции удаления товара из маленькой корзины
		smallCartDeleteItem();
	})
}

/**
 * функция добавляет новый товар в маленькую корзину.
 * @param item(obj)
 */
function addSmallCart(item) {
	// создаем элемент
	var cartFocusedProduct = document.createElement('div');
	//навешиваем класс на созданный элемент
	cartFocusedProduct.classList.add('cartFocusedProduct');
	// устанавливаем в дата атрибуты id товара
	cartFocusedProduct.dataset.id = item.id;
	// устанавливаем в дата атрибуты id_product
	cartFocusedProduct.dataset.id_product = item.id_product;
	// аппендим в родительский элемент
	cartFocused.insertBefore(cartFocusedProduct, cartFocused.children[0]);
	// создаем ссылку с картинкой
	var imgLink =  document.createElement('a');
	imgLink.href = '#';
	cartFocusedProduct.appendChild(imgLink);
	// создаем ссылку с картинкой
	var img = document.createElement('img');
	// ссылку на картинку устанавливаем
	img.setAttribute('src', item.imgLink);
	img.setAttribute('alt', 'img');
	imgLink.appendChild(img);

	// создаем элемент-обертку для наименования товара, его рейтинга и количества, умноженного на цену единицы товара
	var cartFocusedDescription = document.createElement('div');
	cartFocusedDescription.classList.add('cartFocused-Description');
	cartFocusedProduct.appendChild(cartFocusedDescription);

	// создаем элемент для наименования товара
	var cartFocusedArticle = document.createElement('h4');
	cartFocusedArticle.classList.add('cartFocused-Article');
	cartFocusedArticle.textContent = item.name.substr(0, 15);
	cartFocusedDescription.appendChild(cartFocusedArticle);

	// создаем элемент для рейтинга (звездочки)
	var cartFocusedStars = document.createElement('div');
	cartFocusedStars.classList.add('cartFocused-Stars');
	cartFocusedDescription.appendChild(cartFocusedStars);

	// запускаем цикл, чтобы проставить звездочки (рейтинг товара)
	for (var i = 0; i < 5; i++) {
		var cartStar = document.createElement('i');
		cartStar.classList.add('fas');
		if (i < 4) {
			cartStar.classList.add('fa-star');
		} else {
			cartStar.classList.add('fa-star-half');
		}
		cartFocusedStars.appendChild(cartStar);
	}

	// создаем элемент-обертку для количества, умноженного на цену единицы товара
	var cartFocusedQuantity = document.createElement('div');
	cartFocusedQuantity.classList.add('cartFocused-Quantity');
	cartFocusedDescription.appendChild(cartFocusedQuantity);

	// создаем элемент для количества
	var quantitySmallCart = document.createElement('div');
	quantitySmallCart.classList.add('insideQuantity');
	quantitySmallCart.textContent = item.quantity;
	cartFocusedQuantity.appendChild(quantitySmallCart);

	// создаем элемент умножить
	var spanX = document.createElement('div');
	spanX.innerHTML = '&nbsp; &#215; &nbsp;';
	spanX.classList.add('insideQuantity');
	cartFocusedQuantity.appendChild(spanX);

	// создаем элемент цена единицы товара
	var spanPrice = document.createElement('div');
	spanPrice.textContent = item.price;
	spanPrice.classList.add('insideQuantity');
	cartFocusedQuantity.appendChild(spanPrice);

	// создаем элемент-обертку для крестика
	var cartFocusedCancel = document.createElement('div');
	cartFocusedCancel.classList.add('cartFocused-Cancel');
	cartFocusedProduct.appendChild(cartFocusedCancel);

	// создаем элемент ссылки на крестик
	var cancelLink = document.createElement('a');
	cancelLink.href = '#';
	cartFocusedCancel.appendChild(cancelLink);

	// создаем сам крестик
	var cancelLinkCross = document.createElement('i');
	cancelLinkCross.classList.add('fas');
	cancelLinkCross.classList.add('fa-times-circle');
	cancelLink.appendChild(cancelLinkCross);
}

/**
 * функция изменяет количество товара в маленькой корзине
 * @param id_prod - id товара, на котором следует изменить количество
 * @param amount(int) - количество, которе нужно установить
 */
function patchSmallCart(id_prod, amount) {
	for (var i = 0; i < cartFocused.children.length; i++) {
		if (cartFocused.children[i].getAttribute('data-id_product') === id_prod) {
			cartFocused.children[i].querySelector('.insideQuantity').firstChild.textContent = amount;
			return;
		}
	}
}

// функция выбора товара при клике на нее
function selectItem() {
  [].forEach.call(catalog.children, function(currentItem) {
    currentItem.addEventListener('click', function() {
      // вызов функции запроса товаров с массива CART
			getDataFromServer(urlCart, function (responseCart) {
				if (responseCart.length === 0) {
					addNewItemToCart(currentItem);
					return;
				}
				for (var i = 0; i < responseCart.length; i++) {
					// проверка на наличие товара с id_product на сервере
					if (responseCart[i].id_product === currentItem.dataset.id) { //если есть
						// и это количество передаем в функцию с запросом PATCH в массив CART
						// параметры: текущий объект; его индекс в массиве на сервере; текущ. количество + 1.
						patchItemCart(currentItem, responseCart[i].id, responseCart[i].quantity + 1);

						// вызов функции для изменения количества товара в маленькой корзине
						// передаем id_product  и количество
						patchSmallCart(responseCart[i].id_product, responseCart[i].quantity + 1);
						// и выходим из цикла
						break;
					}
					// проверка на, если товара с данным id_product нет на сервере
					if (i === (responseCart.length - 1)) { // то отправляем запрос на сервер
						// вызываем функцию для запроса на сервер методом POST, добавить новую позицию в массив CART
						addNewItemToCart(currentItem);
						break;
					}
				}
			});
    })
  });
}

// функция отрисовывает товарами из сервера страницу catalog
function renderCatalog(response) {
  response.forEach(function(item, ind) {
    var productUnit = document.createElement('a');
    productUnit.classList.add('productsUnitatalog');
    productUnit.href = '#';
    productUnit.dataset.id = response[ind].id_product;
    catalog.appendChild(productUnit);

    var imgProduct = document.createElement('div');
    imgProduct.classList.add('imgProduct');
    productUnit.appendChild(imgProduct);

    var img = document.createElement('img');
    img.setAttribute('src', response[ind].imgLink);
    img.setAttribute('alt', 'img');
    imgProduct.appendChild(img);

    var nameProduct = document.createElement('div');
    nameProduct.classList.add('nameProduct');
    nameProduct.textContent = response[ind].name;
    productUnit.appendChild(nameProduct);

    var priceProduct = document.createElement('div');
    priceProduct.classList.add('priceProduct');
    priceProduct.textContent = response[ind].price;
    productUnit.appendChild(priceProduct);
  })
}

/**
 * функция добавляет выбранный продукт на сервер http://localhost:3000/cart.
 * @param item(obj)
 */
function addNewItemToCart(item) {
  var xhr = new XMLHttpRequest();
	var json = {
		id_product: item.dataset.id,
		imgLink: item.querySelector('img').getAttribute('src'),
		name: item.querySelector('.nameProduct').innerText,
		price: item.querySelector('.priceProduct').innerText,
		quantity: 1
	};

  json = JSON.stringify(json);
  xhr.open('POST', urlCart);
  xhr.setRequestHeader('Content-type', 'application/json; charset = utf-8');
  xhr.send(json);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log('donePOST');
			// после успешной отправки запроса на добавление, отрендерим маленькую корзину
			renderFocusedCart();

      // вызов функции для добавления данного товара в маленькую корзину
			calculateSmallCart();
    }
  }
}

/**
 * функция изменения данных продукта на сервере.
 * @param item(obj) - текущий объект;
 * @param ind - его индекс в массиве на сервере;
 * @param amount - текущ. количество + 1.
 */
function patchItemCart(item, ind, amount) {
  var xhr = new XMLHttpRequest();

  var json = JSON.stringify({quantity: amount});

  xhr.open('PATCH', urlCart + '/'+ ind);
  xhr.setRequestHeader('Content-type', 'application/json; charset = utf-8');
  xhr.send(json);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log('donePATCH');
			// вызов функции для расчета итоговой суммы маленькой корзины
			calculateSmallCart();
    }
  };
}
/**
 * функция удаляет товар с сервера
 * @param id - товара на сервере
 */
function removeItemFromSmallCart(id) {
	var xhr = new XMLHttpRequest();
	xhr.open('DELETE', urlCart + '/'+ id);
	xhr.send();

	xhr.onreadystatechange = function () {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			console.log('doneDelete');
			calculateSmallCart();
		}
	}
}

/**
 * функция для удаления товара из маленькой корзины при нажатии на крестик
 */
function smallCartDeleteItem() {
	var smallCartCross = cartFocused.querySelectorAll('.fa-times-circle');

	[].forEach.call(smallCartCross, function(currentCross) {
		currentCross.addEventListener('click', function() {
			// вызов функции для удаления с сервера товара с данным id
			removeItemFromSmallCart(currentCross.parentElement.parentElement.parentElement.dataset.id);
			currentCross.parentElement.parentElement.parentElement.remove();
		})
	})
}

// функция подсчитывает сумму товаров в маленькой корзине
function calculateSmallCart() {
	var totalSum = 0;
	var smallCartSum = document.getElementById('smallCartSum');
	getDataFromServer(urlCart, function(responseCart) {
		if (!responseCart.length) { // массив пустой, то выходим из функции
			smallCartSum.innerHTML = '&#36;' + totalSum + '.00';
			return;
		}
		responseCart.forEach(function(obj) {
			totalSum += (parseFloat(obj.price.slice(1)) * +obj.quantity);
		});
		smallCartSum.innerHTML = '&#36;' + totalSum + '.00';

		if(document.getElementById('userLogInSum')) {
			document.getElementById('userLogInSum').innerHTML = 'total: &#36;' + totalSum + '.00';
		}
	})
}

// функционал кнопок выбора страниц.
// навешиваем слушателя на родительский элемент страниц
pages.addEventListener('click', function(event) {
	var pageNum = null;
	var selectPages = null;
	var url = null;
	var current = null;
	// делаем проверку на клик по тегу А
	if (event.target.tagName === 'A' || event.target.tagName === 'I') { // если да, то заходим внутрь
		// запустим цикл, чтобы удалить класс selectedPage-Color (окрашивает в розовый цвет) и  дата атрибут
		for (var i = 0; i < event.target.parentElement.children.length; i++) {
			event.target.parentElement.children[i].classList.remove('selectedPage-Color');
			event.target.parentElement.children[i].removeAttribute("data-select_page");
		}

		// если клик мыши произошел на элементе с тегом "i" (левая или правая стрелка в нумерации)
		if (event.target.tagName === 'I') { // то
			// находим текущую страницу по дата атрибуту
			current = pages.querySelector('[data-select_page = "selectPage"]');
			//снимаем класс с нее
			current.classList.remove('selectedPage-Color');
			//удаляем с нее дата атрибут
			current.removeAttribute("data-select_page");

			// проверка на то, на какую стрелку был клик.
			// Если был клик на левую стрелку, то
			if (event.target.parentElement.getAttribute("data-page_plus_minus") === "pageMinus") {
				// находим предыдущий элемент от текущего элемента и устанавливаем на него класс
				current.previousElementSibling.classList.add('selectedPage-Color');
				// находим предыдущий элемент от текущего элемента и устанавливаем на него дата атрибут
				current.previousElementSibling.dataset.select_page = 'selectPage';
				// номер страницы понижаем на 1
				pageNum = +current.textContent - 1;
				// вызов функции для
				checkFirstPage(current.previousElementSibling);
				// Если был клик на правую стрелку, то
			} else if(event.target.parentElement.getAttribute("data-page_plus_minus") === "pagePlus") {
				// находим следующий элемент от текущего элемента и устанавливаем на него класс
				current.nextElementSibling.classList.add('selectedPage-Color');
				// находим следующий элемент от текущего элемента и устанавливаем на него дата атрибут
				current.nextElementSibling.dataset.select_page = 'selectPage';
				// номер страницы увеличиваем на 1
				pageNum = +current.textContent + 1;
				// вызов функции для проверки
				checkFirstPage(current.nextElementSibling);
			}
			else { // блок для теста
				console.log('error by clicked arrows page_plus-minus');
			}
			// если клик мыши произошел на элементе с тегом "a"(сами номера страниц)
		} else if (event.target.tagName === 'A') {
			// выбранный элемент окрашиваем в розовый цвет
			event.target.classList.add('selectedPage-Color');
			// устанавливаем на выбранную страницу дата атрибут
			event.target.dataset.select_page = 'selectPage';
			// устанавливаем в pageNum номер страницы, исходя из того на какую страницу был клик
			pageNum = event.target.textContent;
			// вызов функции для проверки
			checkFirstPage(event.target);
		} else	{
			console.log('Error, no teg A, no teg I');
		}

		// устанавливаем конец url с нужной страницей и лимитом
		selectPages = '?_page=' + pageNum + '&_limit=' + limitNum;
		// устанавливаем конечный url какой должен быть при запросе на сервер
		url = urlProducts + selectPages;
		console.log(url);

		// запрос на сервер с url указанной страницей и лимитом товаров
		getDataFromServer(url, function (response) {
			// удаляем товары сп редыдущ страницы из DOM
			while (catalog.firstChild) {
				catalog.removeChild(catalog.firstChild);
			}
			if(!response.length) {
				var noGoods = document.createElement('div');
				noGoods.innerHTML = 'No more goods &nbsp; :(';
				noGoods.classList.add('textNoGoods');
				catalog.appendChild(noGoods);
				return;
			}
			// вызов функции для отрисования товаров в каталоге исходя из полученного ответа из сервера
			renderCatalog(response);
			// вызов функции для выбора товара в каталоге.
			selectItem();
		});
	}

	/**
	 * функция - при выборе первой страницы левую стрелку делает неактивной
	 * @param elem - элемент, который проверяется
	 */
	function checkFirstPage(elem) {
		// если выбрана первая страница
		if (elem.parentElement.firstElementChild.nextElementSibling === elem) {
			// то с левой стрелки снимаем класс selectedPage-Color
			elem.parentElement.firstElementChild.classList.remove('selectedPage-Color');
			// и делаем ее неактивной
			elem.parentElement.firstElementChild.classList.add('disabled');
			// то крайнюю правую стрелку окрашиваем в розовый цвет
			elem.parentElement.lastElementChild.classList.add('selectedPage-Color');
			// снимаем с правой стрелки класс disabled
			elem.parentElement.lastElementChild.classList.remove('disabled');

			// если выбрана последняя страница
		} else if(elem.parentElement.lastElementChild.previousElementSibling === elem) {
			// то крайнюю левую стрелку окрашиваем в розовый цвет
			elem.parentElement.firstElementChild.classList.add('selectedPage-Color');
			// и делаем ее активной (снимаем класс - disabled)
			elem.parentElement.firstElementChild.classList.remove('disabled');
			// то с правой стрелки снимаем класс selectedPage-Color
			elem.parentElement.lastElementChild.classList.remove('selectedPage-Color');
			// и делаем ее неактивной
			elem.parentElement.lastElementChild.classList.add('disabled');
		} else{ // иначе страница не первая и не последняя
			// то крайнюю левую стрелку окрашиваем в розовый цвет
			elem.parentElement.firstElementChild.classList.add('selectedPage-Color');
			// то крайнюю правую стрелку окрашиваем в розовый цвет
			elem.parentElement.lastElementChild.classList.add('selectedPage-Color');
			// снимаем с левой стрелки класс disabled
			elem.parentElement.firstElementChild.classList.remove('disabled');
			// снимаем с правой стрелки класс disabled
			elem.parentElement.lastElementChild.classList.remove('disabled');
		}
	}
});

// функционал кнопки "View All".
// находим данную кнопку и навешиваем слушателя на него
document.getElementById('btnViewAll').addEventListener('click', function() {
	// вызов функции для отправки запроса на сервер (с указанием url) и вызов callback функции полсе получения ответа
	getDataFromServer(urlProducts, function (response) {
		// удаляем товары сп редыдущ страницы из DOM
		while (catalog.firstChild) {
			catalog.removeChild(catalog.firstChild);
		}
		// отрисовываем страницу каталога с товарами исходя их полученного ответа
		renderCatalog(response);
		// вызов функции для выбора товара в каталоге.
		selectItem();
	})
});

/**
 * функция отрисовывает в DOM залогиненного пользователя
 * @param user (объект)
 */
function addUserLogged(user) {
	// аппендим элемент - обертку залогиненного пользователя
	header.insertBefore(userNameHeader, header.lastElementChild);

	// создаем элемент указания имени залогиненного пользователя
	var userNameHeaderInside = document.createElement('div');
	userNameHeaderInside.textContent = 'User: ' + user.name;
	userNameHeader.appendChild(userNameHeaderInside);

	// создаем элемент указания суммы товаров в корзине пользователя
	var userLogInSum = document.createElement('div');
	// устанавливаем идентификатор
	userLogInSum.id = 'userLogInSum';
	// устанавливаем сумму товаров
	userLogInSum.textContent = 'total:  ' + smallCartSum.textContent;
	userNameHeader.appendChild(userLogInSum);

	// создаем кнопку для выхода
	var userLogOutBtn = document.createElement('a');
	userLogOutBtn.textContent = 'Log Out';
	userLogOutBtn.classList.add('btnLogOut');
	userLogOutBtn.href = '';
	userNameHeader.appendChild(userLogOutBtn);

	// навешиваем на кнопку обработчик для выхода
	userLogOutBtn.addEventListener('click', function() {
		// вызов функции запроса на сервер для удаления пользователя из массива залогинного пользователя http://localhost:3000/userLoggedIn
		requestDelete(urlLoggedUser);
		// функция показывает сообщение при разлогинивании
		goodByeText(user);
		// здесь удаляется блок в Header е
		userLogOutBtn.parentElement.remove();
	})
}

/**
 * функция отправляет запрос на удаления товара с сервера указанного url
 * так как массив может содержать только один товар, то id всегда равно одному
 * @param url - адресс массива с которго нужно удалить товар
 */
function requestDelete(url) {
	var xhr = new XMLHttpRequest();
	// с методом DELETE  и url c последней записью
	xhr.open('DELETE', url + '/1');
	xhr.send();

	xhr.onreadystatechange = function () {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			console.log('doneDELETE');
		}
	}
}

// функция показывает сообщение при разлогинивании
function goodByeText(user) {
	alert('Good bye ' + user.name + '!');
}