"use strict";

// url массива залогиненного пользователя
var urlLoggedUser = 'http://localhost:3000/userLoggedIn';
// url массива товаров помещенных в корзину
var urlCart = 'http://localhost:3000/cart';
// находим маленькую корзину
var cartFocused = document.getElementById('cartFocused');
// находим header
var header = document.getElementById('header');
// создаем элемент для залогиненного пользователя в header е
var userNameHeader = document.createElement('div');
// находим элемент в маленькой корзине с итоговой суммой
var smallCartSum = document.getElementById('smallCartSum');


// функция запрашивает данные на сервере с массива userLoggedIn
getDataFromServer(urlLoggedUser, function (response) {
	// если массив пустой, то выходим
	if(!response.length) {
		return;
	}
	// функция для отображения в DOM залогиненного пользователя
	addUserLogged(response[0]);
});

// вызов функции для запроса данных с сервера с массива users
getDataFromServer(urlCart, function (response) {
	if (!response.length) { // массив пустой, то выходим из функции
		return;
	}
	// функция рендерит маленькую корзину
	renderFocusedCart();
	// вызов функции для расчета суммы в маленькой корзине.
	calculateSmallCart();
});

// функция запрашиваtn данные с указанного url в параметрах
// и вывзывается функция колбек после заверешения работы функции
function getDataFromServer(url, callback) {
	var response = null;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url);
	xhr.send();

	xhr.onreadystatechange = function () {
		if(xhr.readyState === XMLHttpRequest.DONE) {
			response = JSON.parse(xhr.responseText);

			callback(response);
		}
	}
}

// функция показывает сообщение при разлогинивании
function goodByeText(user) {
	alert('Good bye ' + user.name + '!');
}

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
	//
	userLogInSum.textContent = 'total: - ' + smallCartSum.textContent;
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

	var cartFocusedDescription = document.createElement('div');
	cartFocusedDescription.classList.add('cartFocused-Description');
	cartFocusedProduct.appendChild(cartFocusedDescription);

	var cartFocusedArticle = document.createElement('h4');
	cartFocusedArticle.classList.add('cartFocused-Article');
	cartFocusedArticle.textContent = item.name.substr(0, 15);
	cartFocusedDescription.appendChild(cartFocusedArticle);

	var cartFocusedStars = document.createElement('div');
	cartFocusedStars.classList.add('cartFocused-Stars');
	cartFocusedDescription.appendChild(cartFocusedStars);

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

	var cartFocusedQuantity = document.createElement('div');
	cartFocusedQuantity.classList.add('cartFocused-Quantity');
	cartFocusedDescription.appendChild(cartFocusedQuantity);

	var quantitySmallCart = document.createElement('div');
	quantitySmallCart.classList.add('insideQuantity');
	quantitySmallCart.textContent = item.quantity;
	cartFocusedQuantity.appendChild(quantitySmallCart);

	var spanX = document.createElement('div');
	spanX.innerHTML = '&nbsp; &#215; &nbsp;';
	spanX.classList.add('insideQuantity');
	cartFocusedQuantity.appendChild(spanX);

	var spanPrice = document.createElement('div');
	spanPrice.textContent = item.price;
	spanPrice.classList.add('insideQuantity');
	cartFocusedQuantity.appendChild(spanPrice);

	var cartFocusedCancel = document.createElement('div');
	cartFocusedCancel.classList.add('cartFocused-Cancel');
	cartFocusedProduct.appendChild(cartFocusedCancel);

	var cancelLink = document.createElement('a');
	cancelLink.href = '#';
	cartFocusedCancel.appendChild(cancelLink);

	var cancelLinkCross = document.createElement('i');
	cancelLinkCross.classList.add('fas');
	cancelLinkCross.classList.add('fa-times-circle');
	cancelLink.appendChild(cancelLinkCross);
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
		// устанавливаем общую сумму в маленькую корзину
		smallCartSum.innerHTML = '&#36;' + totalSum + '.00';

		// если есть залогиненный пользователь
		if (document.getElementById('userLogInSum')) {
			// то, дублирум сумму товаров в окне залогиненного пользователя
			document.getElementById('userLogInSum').innerHTML = 'total: &#36;' + totalSum + '.00';
		}
	})
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
