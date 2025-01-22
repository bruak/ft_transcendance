// Bu dosya, web sayfasındaki etkileşimli işlevsellik için JavaScript kodunu içerecektir.
// Şu anda herhangi bir işlevsellik eklenmemiştir.
document.getElementById('switch-to-register').addEventListener('click', function(event) {
	event.preventDefault();
	document.getElementById('login-form').classList.add('slide-out');
	document.getElementById('register-form').classList.remove('hidden');
	document.getElementById('register-form').classList.add('slide-in');
	setTimeout(function() {
		document.getElementById('login-form').classList.add('hidden');
		document.getElementById('login-form').classList.remove('slide-out');
	}, 500);
});

document.getElementById('switch-to-login').addEventListener('click', function(event) {
	event.preventDefault();
	document.getElementById('register-form').classList.add('slide-out');
	document.getElementById('login-form').classList.remove('hidden');
	document.getElementById('login-form').classList.add('slide-in');
	setTimeout(function() {
		document.getElementById('register-form').classList.add('hidden');
		document.getElementById('register-form').classList.remove('slide-out');
	}, 500);
});
