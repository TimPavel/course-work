"use strict";

// находим родительский элемент товаров в каталоге
var cartProductsBlock = document.getElementById('cartProducts');
// url массива товаров помещенных в корзину
var urlCart = 'http://localhost:3000/cart';
// url массива залогиненного пользователя
var urlLoggedUser = 'http://localhost:3000/userLoggedIn';
// находим header
var header = document.getElementById('header');
// создаем элемент для залогиненного пользователя в header е
var userNameHeader = document.createElement('div');
// находим элемент в маленькой корзине с итоговой суммой
var smallCartSum = document.getElementById('smallCartSum');
// находим маленькую корзину
var cartFocused = document.getElementById('cartFocused');

// функция запрашивает данные на сервере с массива userLoggedIn
getDataFromServer(urlLoggedUser, function (response) {
	// если массив пустой, то выходим
	if(!response.length) {
		return;
	}
	// функция для отображения в DOM залогиненного пользователя
	addUserLogged(response[0]);
});

(function() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', urlCart);
  xhr.send();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      var response = JSON.parse(xhr.responseText);
      if (!response.length) {
        countTotalPrice();
        return;
      }
			// вызов функции для отрисовывания корзины с товарами на странице
			renderCart(response);
      // функция рассчитывает итоговую цену для одного продукта
      countUnitPrice();
      // функция показывает итоговую цену для одного продукта
      countTotalPrice();
      // функция отрисовывает "маленькую корзину" при загрузке страницы.
			renderFocusedCart(response);
    }
  }
})();

// функция отрисовывает "маленькую корзину" при загрузке страницы.
function renderFocusedCart(responseCart) {
  // полученный массив перебираем и отрисовываем в "маленькой корзине".
  responseCart.forEach(function(item) {
    // вызываем функция для добавления товара в маленькую корзину.
    addSmallCart(item);
  });
	// вызов функции удаления товара из маленькой корзины
	smallCartDeleteItem();
}

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

// функция добавляет новый товар в маленькую корзину.
function addSmallCart(item) {
	// создаем элемент
	var cartFocusedProduct = document.createElement('div');
	//навешиваем класс на созданный элемент
	cartFocusedProduct.classList.add('cartFocusedProduct');
	// устанавливаем в дата атрибуты id
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
 * функция отрисовывает корзину исходя из данных на сервере 'http://localhost:3000/cart'.
 * @param response - объект, данные с сервера 'http://localhost:3000/cart'.
 */
function renderCart(response) {
	// перебираем массив объектов
  response.forEach(function (item, ind) {
  	// создаем элемент обертку товара
    var cartProduct = document.createElement('div');
    cartProduct.classList.add('rowProducts');
    cartProduct.dataset.id = response[ind].id;
    cartProduct.dataset.id_product = response[ind].id_product;

    cartProductsBlock.appendChild(cartProduct);

    var productCard = document.createElement('div');
    productCard.classList.add('productCard');
    cartProduct.appendChild(productCard);
    var productCardLink = document.createElement('a');
    productCardLink.setAttribute('href', "single_page.html");
    productCard.appendChild(productCardLink);
    var productCardImg = document.createElement('img');
    productCardImg.setAttribute('src', item.imgLink);
    productCardLink.appendChild(productCardImg);

    var textProductCard = document.createElement('section');
    textProductCard.classList.add('textProductCard');
    productCard.appendChild(textProductCard);
    var textProductCardH4 = document.createElement('H4');
    textProductCard.appendChild(textProductCardH4);
    var textProductCardH4Link = document.createElement('a');
    textProductCardH4Link.setAttribute('href', "#");
    textProductCardH4Link.textContent = item.name;
    textProductCardH4.appendChild(textProductCardH4Link);

    var textProductCardPar = document.createElement('p');
    textProductCardPar.textContent = 'Color:  ';
    textProductCard.appendChild(textProductCardPar);

    var textProductCard_Span = document.createElement('span');
    textProductCard_Span.textContent = '  Red';
    textProductCardPar.appendChild(textProductCard_Span);

    var textProductCard_Par2 = document.createElement('p');
    textProductCard_Par2.textContent = 'Size:  ';
    textProductCard.appendChild(textProductCard_Par2);

    var textProductCard_Span2 = document.createElement('span');
    textProductCard_Span2.textContent = '  Xll';
    textProductCard_Par2.appendChild(textProductCard_Span2);

    var productPrice = document.createElement('div');
    var productPricePar = document.createElement('p');
    productPrice.classList.add('productPrice');
    productPricePar.textContent = item.price;
    cartProduct.appendChild(productPrice);
    productPrice.appendChild(productPricePar);

    var productQuantity = document.createElement('div');
    productQuantity.classList.add('productQuantity');
    cartProduct.appendChild(productQuantity);
    var quantityForm = document.createElement('form');
    productQuantity.appendChild(quantityForm);
    var quantityInput = document.createElement('input');
    quantityInput.setAttribute('type', 'number');
    quantityInput.value = item.quantity;
    quantityForm.appendChild(quantityInput);

    var productShipping = document.createElement('div');
    productShipping.classList.add('productShipping');
    cartProduct.appendChild(productShipping);
    var productShippingPar = document.createElement('p');
    productShippingPar.textContent = 'FREE';
    productShipping.appendChild(productShippingPar);

    var productSubtotal = document.createElement('div');
    productSubtotal.classList.add('productSubtotal');
    cartProduct.appendChild(productSubtotal);
    var productSubtotalPar = document.createElement('p');
    productSubtotalPar.textContent = '$' + (parseInt(productPricePar.textContent.slice(1)) * parseInt(quantityInput.value));
    productSubtotal.appendChild(productSubtotalPar);

    var productAction = document.createElement('div');
    productAction.classList.add('productAction');
    cartProduct.appendChild(productAction);
    var productActionLink = document.createElement('a');
    productActionLink.classList.add('actionCross');
    productAction.appendChild(productActionLink);
    var productActionIcon = document.createElement('i');
    productActionIcon.classList.add('fa');
    productActionIcon.classList.add('fa-times-circle');
    productActionLink.appendChild(productActionIcon);
  });

// находим все крестики для удаления товара
var actionCross = cartProductsBlock.querySelectorAll('.actionCross');
// перебираем все крестики

	//перебираем крестики
actionCross.forEach(function(item) {
	// навешиваем событие клика на крестик
	item.addEventListener('click', function () {
		// получаем id товара
		var id = item.parentElement.parentElement.dataset.id_product;
		// находим удаляемый элемент в маленькой корзине по дата атрибуту
		var elemSmallCart = cartFocused.querySelector('[data-id_product = "' + id + '"]');
		// вызов функции для удадения товара из маленькой корзины
		deleteItem(elemSmallCart);
		// вызов функции для очищения товара из корзины(DOM элекменты) в аргументы передаем удаляеый элемент
		deleteItem(item.parentElement.parentElement);

		// вызов функции для удаления товара с массива cart на сервере при нажатии на крестик
		removeThisProduct(item.parentElement.parentElement.dataset.id)
	})
});

  // находим кнопку CLEAR SHOPPING CART
  var btnClearAll = document.getElementById('clearAll');
  // навешиваем событие клика на нее
  btnClearAll.addEventListener('click', function () {
    // вызов очищения корзины
    removeAll(cartProductsBlock.children);
		// вызов функции для удаления маленькой корзины
		deleteSmallCart(document.getElementById('cartFocused'));
  })
}

/**
 * функция для удаления из корзины товара (DOM элекмента)
 * @param element - удаляемый элемент
 */
function deleteItem(element) {
	element.remove()
}

/**
 * функция очищает маленькую корзину
 * @param parentElem - родительский DOM элемент
 */
function deleteSmallCart(parentElem) {
	while(parentElem.querySelector('.cartFocusedProduct')) {
		parentElem.querySelector('.cartFocusedProduct').remove();
	}
}

// функцию рассчитывает сумму исходя из количества и цены товара
function countUnitPrice() {
	// находим инпуты с количеством товара
  var inputQuantity = cartProductsBlock.querySelectorAll('input');
  // перебираем их
  inputQuantity.forEach(function (elem) {
  	// навешиваем на каждый инпут слушателя на изменение
    elem.addEventListener('change', function() {
    	// находим в DOM цену за единицу товара
    	var priceUnit = elem.parentElement.parentElement.parentElement.querySelector('.productPrice').firstElementChild.textContent;
			// находим в DOM элемент отображающий промежуточную сумму
    	var subtotal = elem.parentElement.parentElement.parentElement.querySelector('.productSubtotal').firstElementChild;

    	// и в элемент с промежуточной суммой устанавливаем произведение количества товара на его цену
      subtotal.textContent = '$' + (parseInt(elem.value) * parseInt(priceUnit.slice(1)));
      // вызов функции для обновления итоговой суммы всех позий в корзине.
      countTotalPrice();
    })
  })
}

// функция рассчитывает итоговую сумму
function countTotalPrice() {
	// находим в DOM элемент отображающий итoговую цену SUB TOTAL
  var totalPrice = document.getElementById('totalPrice');
	// находим в DOM элемент отображающий итoговую цену GRAND TOTAL
  var totalPriceSmall = document.getElementById('totalPriceSmall');
  var sum = 0;
  var smallCartSum = document.getElementById('smallCartSum');
  // находим все числа для сложения
  var addendum = document.querySelectorAll('.productSubtotal');
  // перебираем их
  addendum.forEach(function (num) {
  	// в сумму записываем все слагаемые
     sum += parseInt(num.firstChild.textContent.slice(1));
  });
  // выводим в DOM полученный результат
  totalPriceSmall.innerHTML = "Sub total " + '&nbsp; ' + " $ " + sum + '.00';

  totalPrice.textContent = "$ " + sum + '.00';
	// выводим в DOM в маленькую корзину полученный результат
	smallCartSum.textContent = "$ " + sum + '.00';

	// если есть залогиненный пользователь
	if (document.getElementById('userLogInSum')) {
		// то, дублирум сумму товаров в окне залогиненного пользователя
		document.getElementById('userLogInSum').innerHTML = 'total: &#36;' + sum + '.00';
	}
}

// функция удаления товара с массива cart на сервере при нажатии на крестик
function removeThisProduct(id) {
  // создаем новый запрос.
  var xhr = new XMLHttpRequest();
  // метод запроса DELETE  и в конце url дописываем id нужной записи.
  xhr.open('DELETE', urlCart + '/' + id);
  xhr.send();

    xhr.onreadystatechange = function() {
    if(xhr.readyState === XMLHttpRequest.DONE) {
      console.log('удален продукт с ID - ' + id);
    }
  };
	// вызов функции для рассчитывания итоговой суммы.
  countTotalPrice();
}

// функция очищает всю корзину (DOM элементы) и все записи на сервере в массиве cart.
function removeAll(children) {

  if (children.length > 1) {
    for (var i = cartProductsBlock.children.length - 1; i > 0; i--) {
      cartProductsBlock.children[i].remove();
    }
  }

  // создаем новый запрос
  var xhr = new XMLHttpRequest();
  // запрос с методом GET для получения информации с сервера.
  xhr.open('GET', urlCart);
  xhr.send();

  xhr.onreadystatechange = function () {
    if(xhr.readyState === XMLHttpRequest.DONE) {
      // после того, как обработка запроса закончена и ответ готов.
      // парсим ответ в объект и сохраняем его в response.
      var response = JSON.parse(xhr.responseText);

      if (response.length) { // если есть записи на сервере, заходим внутрь
        // получаем id из последнего объекта в массиве.
        var id = response[response.length - 1].id;
        xhr = new XMLHttpRequest();
        // с методом DELETE  и url c последней записью
        xhr.open('DELETE', urlCart + '/'+ id);
        xhr.send();

        xhr.onreadystatechange = function () {
          if(xhr.readyState === XMLHttpRequest.DONE){
            // после того, как обработка закончена, вызываем функцию deleteAll пока будут записи
            removeAll(children);
          }
        }
      }
    }
  };
	// вызов функции для рассчитывания итоговой суммы.
  countTotalPrice();
}

/**
 * функция для удаления товара из маленькой корзины при нажатии на крестик
 */
function smallCartDeleteItem() {
	// навешиваем слушателя на родителя крестика
	cartFocused.addEventListener('click', function(event) {
		// проверка на клик по тегу "i" и наличия у тега класса 'fa-times-circle'
		if(event.target.tagName === 'I' && event.target.classList.contains('fa-times-circle')) {
			// вызов функции для удаления товара из маленькой корзины
			deleteItem(event.target.parentElement.parentElement.parentElement);
			// получаем id удаляемого товара
			var id = event.target.parentElement.parentElement.parentElement.dataset.id_product;

			// находим удаляемый элемент в большой корзине по data attr -  id
			var elem = cartProductsBlock.querySelector('[data-id_product = "'+id+'"]');
			// вызов функции для удаления товара из большой корзины и передаем удаляемый элемент
			deleteItem(elem);
			// вызов функции для удаления с сервера товара с данным id
			removeThisProduct(event.target.parentElement.parentElement.parentElement.dataset.id);
		}
	})
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

	userLogInSum.textContent = 'total:  $0.00';
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