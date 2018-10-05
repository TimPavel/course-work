"use strict";

// url массива всех зарегистрированных пользователей
var urlUsers = 'http://localhost:3000/users';
// url массива залогиненного пользователя
var urlLoggedUser = 'http://localhost:3000/userLoggedIn';
// url массива товаров помещенных в корзину
var urlCart = 'http://localhost:3000/cart';
// находим форму для Log In а
var loginBlock = document.getElementById('loginBlock');
// находим кнопку LogIn
var btnLogin = document.getElementById('btnLogin');
// находим маленькую корзину
var cartFocused = document.getElementById('cartFocused');
// находим header
var header = document.getElementById('header');
// создаем элемент для залогиненного пользователя в header е
var userNameHeader = document.createElement('div');
// находим элемент в маленькой корзине с итоговой суммой
var smallCartSum = document.getElementById('smallCartSum');

// объект с введенные данные пользователем в форме Log In
var dataUser = {
	email: null,
	password: null
};
// находим все инпуты в форме Log In
var inputs = loginBlock.querySelectorAll('input');

// функция запрашивает данные на сервере с массива userLoggedIn
getDataFromServer(urlLoggedUser, function (response) {
	// если массив пустой, то выходим
	if(!response.length) {
		return;
	}
	console.log(response);
	// функция для отображения в DOM залогиненного пользователя
	addUserLogged(response[0]);
	// вызов функции для скрытия формы для входа (так как пользователь уже залогинен)
	addClassDisplayNone(document.getElementById('formLogIn'));
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

// на кнопку Log In навешиваем слушателя на клик мыши
btnLogin.addEventListener('click', function () {
	// вызов функции для снятия обрамления
	removeRedBorder();
	// перебираем инпуты из формы Log In и заносим их в объект dataUser
	Object.keys(dataUser).forEach(function(key, index) {
		if(key === 'email') {
			dataUser[key] = inputs[index].value;
		}
		else if(key === 'password') {
			dataUser[key] = inputs[index].value;
		}
	});
	event.preventDefault();

	// вызов функции для запроса данных с сервера с массива users
	getDataFromServer(urlUsers, function (response) {
		// находим или не находим правильныеданные совпадающие с уже ранее зарегистрированными ползователями
		response.some(function(user) {
			if (user.email === dataUser.email && user.password === dataUser.password) {
				// функция запускает приветственнгое сообщение
				welcomeText(user);
				// вызов функции для отрисовывания и добавления в DOM залогиненного пользователя
				addUserLogged(user);
				// вызов функции для POST запроса на сервер для добавления залогиненного пользователя
				postRequest(urlLoggedUser, user.id_user, user.name, user.password, user.email, user.creditCard, user.gender);
				// вызов функции для установления display none для формы Log In
				// то есть скрываем форму для логина, так как залогиненным может только быть один пользователь
				addClassDisplayNone(document.getElementById('formLogIn'));
				// вызов функции удаления для красной рамки с инпутов
				removeRedBorder();
			} else { // иначе, если введенные данные не корректно, то
				// вызов функции для добавления красной рамки для инпутов
				setRedBorder();
			}
		});
	});
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

// функция отправляет данные на сервер методом POST
function postRequest(url, id_user, name, password, email, creditcard, gender) {
	var xhr = new XMLHttpRequest();

	var json = {
		id_user: id_user,
		name: name,
		password: password,
		email: email,
		creditCard: creditcard,
		gender: gender
	};

	json = JSON.stringify(json);
	xhr.open('POST', url);
	xhr.setRequestHeader('Content-type', 'application/json; charset = utf-8');
	xhr.send(json);

	xhr.onreadystatechange = function () {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			console.log('donePOST');
		}
	}
}

/**
 * функция очищает инпуты
 */
function clearInputLogin() {
	[].forEach.call(inputs, function (input) {
		input.value = '';
	})
}

/**
 * функция устанавливает навешивает класс на элемент(устанавливает красную рамку)
 */
function setRedBorder() {
	[].forEach.call(inputs, function (input) {
		input.classList.add('rightBorder');
	})
}

/**
 * функция удаляет класс на элементах инпутс (удаляет красную рамку)
 */
function removeRedBorder() {
	[].forEach.call(inputs, function (input) {
		input.classList.remove('rightBorder');
	})
}

/**
 * функция показывает приветственное сообщение
 * @param user (объект)
 */
function welcomeText(user) {
	alert('Welcome ' + user.name + '!');
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
		// функция убирает display none с формы Log In
		removeClassDisplayNone(document.getElementById('formLogIn'));
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

// функция добавляет класс (display: none)
function addClassDisplayNone(elem) {
	elem.classList.add('displayNone');
}
// функция удаляет класс (display: none)
function removeClassDisplayNone(elem) {
	elem.classList.remove('displayNone');
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
		smallCartSum.innerHTML = 'total: &#36;' + totalSum + '.00';

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
