"use strict";


//находим все инпуты и кладем их в инпутс
var inputs = document.querySelectorAll('input');
//находим инпут для имени
var nameField = document.getElementById('nameField');
//устанавливаем регулярное выражение для имени и для поля с текстом
var nameFieldRegExp = /[A-Za-zЁёА-Яа-я\d]+/;
//создаем блок для сообщения об ошибке при вводе имени
var errorMessageName = document.createElement('div');
//устанавливаем сам текст для сообщения при введенного несоответствии значения и установленного регулярного выражения для имени
var textErrorForName = 'Not correct name, fill the field by only characters.';

//находим инпут для телефонного номера
var passwordField = document.getElementById('passwordField');
//устанавливаем регулярное выражение для телефонного номера
var passRegExp = /[A-Za-z\d]{8,}/;
//создаем блок для сообщения об ошибке при вводе телефонного номера
var errorMessagePassword = document.createElement('div');
//устанавливаем сам текст для сообщения при несоответствии значения и установленного регулярного выражения для номера
var textErrorForPassword = 'use different symbols, min. 8 characters';

//находим инпут для емейла
var emailField = document.getElementById('emailField');
//устанавливаем регулярное выражение для емейла
var emailRegExp = /((\w+|\w+\.\w+|\w+-\w+)@[a-zA-Z_]+?\.[a-zA-Z]{2,3})$/;
//создаем блок для сообщения об ошибке при вводе емейла
var errorMessageEmail = document.createElement('div');
//устанавливаем сам текст для сообщения при несоответствии значения и установленного регулярного выражения для емейла
var textErrorForEmail = 'Not correct email, please use this formats\nmymail@mail.ru, or my.mail@mail.ru, or my-mail@mail.ru';

//находим инпут для кредитной карты
var cardField = document.getElementById('cardField');
//устанавливаем регулярное выражение для карты
var cardRegExp = /^[\d]{7}-[\d]{4}-[\d]{6}-[\d]{3}$/;
//создаем блок для сообщения об ошибке при вводе текста
var errorMessageCard = document.createElement('div');
//устанавливаем сам текст сообщения при несоответствии введенного значения и установленного регулярного выражения для текста
var textErrorForCardField  = 'Not correct card, must be this format 0000000-0000-000000-000';

////находим кнопку отправить
var buttonSend = document.getElementById('buttonSend');

var urlUsers = 'http://localhost:3000/users';
var radioGender = document.getElementById('radioGender');
var gender = null;
var id_user = 201;

function getGenderValue() {
	var inputs = radioGender.querySelectorAll('input');
	for (var k = 0; k < inputs.length; k++) {
		if(inputs[k].checked === true) {
			return gender = inputs[k].value;
		}
	}
}

// функция отправляет данные на сервер методом POST
function postRequest(url, name, password, email, creditcard, gender) {
	var xhr = new XMLHttpRequest();
	// TODO correct counter
	id_user = id_user + 1;
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


document.getElementById('button').addEventListener('click', function() {
	console.log(getGenderValue());
});

//навешиваем обработчик на кнопку
buttonSend.addEventListener('click', function(event){
	//цикл для проверки значений хоть в каком нибуде инпуте при нажатии кнопки отправить

	for (var i = 0; i < inputs.length - 2; i++) {
		// проверяем инпуты на наличие в них значений и соответствию значений в них рег.выражению
		if ( !(inputs[i].id === 'nameField' && nameFieldRegExp.test(inputs[i].value)) &&
			!(inputs[i].id === 'passwordField' && passRegExp.test(inputs[i].value)) &&
			!(inputs[i].id === 'emailField' && emailRegExp.test(inputs[i].value)) &&
			!(inputs[i].id === 'cardField' && cardRegExp.test(inputs[i].value))) {

			if(inputs[i].id === 'cardField') {
				// вызываем функция для устаноки ошибки при вводе кредитной карты
				setErrorNotCorrectInput(inputs[i], 'userStyleInput', errorMessageCard, textErrorForCardField, 'messageForError');
			}

			if(inputs[i].id === 'emailField') {
				// вызываем функция для устаноки ошибки при вводе емейла
				setErrorNotCorrectInput(inputs[i], 'userStyleInput', errorMessageEmail, textErrorForEmail, 'messageForError');
			}

			if(inputs[i].id === 'passwordField') {
				// вызываем функция для устаноки ошибки при вводе номера телефона
				setErrorNotCorrectInput(inputs[i], 'userStyleInput', errorMessagePassword, textErrorForPassword, 'messageForError');
			}

			if(inputs[i].id === 'nameField') {
				// вызываем функция для устаноки ошибки при вводе имени
				setErrorNotCorrectInput(inputs[i], 'userStyleInput', errorMessageName, textErrorForName, 'messageForError');
			}

			//отменяем действие кнопки по умолчанию
			event.preventDefault();

		} else { //иначе, снимаем обрамление
			inputs[i].classList.remove('userStyleInput');

		}
	}
	// вызов функции для получения пола
	getGenderValue();
	// вызов функции для отправки данных
	postRequest(urlUsers, nameField.value, passwordField.value, emailField.value, cardField.value, gender);
	//отменяем действие кнопки по умолчанию
	event.preventDefault();

});

//навешиваем обработчик blur на инпут для текста.
cardField.addEventListener('blur', function(){
	if(!(cardRegExp.test(cardField.value))) {// если есть несоответствие значения и рег.выраж.
		// вызываем функция для устаноки ошибки при вводе даты рождения.
		setErrorNotCorrectInput(cardField, 'userStyleInput', errorMessageCard, textErrorForCardField, 'messageForError');

	} else { //иначе,
		if (document.body.contains(errorMessageCard)) { //если есть сообщени об ошибке для данного инпута
			//удаляем данное сообщение
			cardField.parentElement.removeChild(errorMessageCard);
		}
		// также удаляем обрамление
		cardField.classList.remove('userStyleInput');
	}
});

//навешиваем обработчик blur на инпут для email а.
emailField.addEventListener('blur', function(){
	if(!emailRegExp.test(emailField.value)) {// если есть несоответствие значения и рег.выраж.
		// вызываем функция для устаноки ошибки при вводе емейла
		setErrorNotCorrectInput(emailField, 'userStyleInput', errorMessageEmail, textErrorForEmail, 'messageForError');

	} else {  //иначе,
		if (document.body.contains(errorMessageEmail)) { //если есть сообщени об ошибке для данного инпута.
			//удаляем данное сообщение.
			emailField.parentElement.removeChild(errorMessageEmail);
		}
		// также удаляем обрамление
		emailField.classList.remove('userStyleInput');
	}
});

//навешиваем обработчик blur на инпут для телефонного номера
passwordField.addEventListener('blur', function(){
	if(!passRegExp.test(passwordField.value)) {  // если есть несоответствие значения и рег.выраж
		// вызываем функция для устаноки ошибки при вводе телефонного номера.
		setErrorNotCorrectInput(passwordField, 'userStyleInput', errorMessagePassword, textErrorForPassword, 'messageForError');

	} else { //иначе,
		if (document.body.contains(errorMessagePassword)) { //если есть сообщени об ошибке для данного инпута
			//удаляем данное сообщение
			passwordField.parentElement.removeChild(errorMessagePassword);
		}
		// также удаляем обрамление
		passwordField.classList.remove('userStyleInput');
	}
});

//навешиваем обработчик blur на инпут для имени
nameField.addEventListener('blur', function(){
	if(!nameFieldRegExp.test(nameField.value)) {  // если есть несоответствие значения и рег.выраж
		// вызываем функция для устаноки ошибки при вводе имени.
		setErrorNotCorrectInput(nameField, 'userStyleInput', errorMessageName, textErrorForName, 'messageForError');
	} else { //иначе,
		if (document.body.contains(errorMessageName)) { //если есть сообщени об ошибке для данного инпута
			//удаляем данное сообщение
			nameField.parentElement.removeChild(errorMessageName);
		}
		// также удаляем обрамление
		nameField.classList.remove('userStyleInput');
	}
});

/**
 * Функция для установки сообщения об ощибке ввода и обрамление рамкой.
 * @param element - сам инпут
 * @param classForElement - класса для инпута
 * @param errorEl - элемент сообщения об ошибке
 * @param errorText - текст для элемент сообщения об ошибке
 * @param errorTextClass - класс для  элемента сообщения об ошибке
 */
function setErrorNotCorrectInput(element, classForElement, errorEl, errorText, errorTextClass) {
	element.classList.add(classForElement);
	//добавляем класс для сообщения об ошибке
	errorEl.classList.add(errorTextClass);
	// устанавливаем заготовленный текст для данного случая
	errorEl.textContent = errorText;
	// аппендим сообщение об ошибке при вводе текста
	element.parentElement.appendChild(errorEl);

	$(element).effect("bounce", "slow", 1000);
	$('#message').text(errorText).dialog('open');
}

console.log(document.cookie );