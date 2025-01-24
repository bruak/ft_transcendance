/* Sidenav Açma */
function openNav() {
	document.getElementById("myNav").style.width = "100%";
}

/* Sidenav Kapatma */
function closeNav() {
	document.getElementById("myNav").style.width = "0%";
}

document.getElementById('editProfileForm').addEventListener('submit', function(event) {
	event.preventDefault();

	const name = document.getElementById('profileName').value;
	const title = document.getElementById('profileTitle').value;
	const location = document.getElementById('profileLocation').value;
	const image = document.getElementById('profileImage').files[0];

	document.querySelector('.card h1').textContent = name;
	document.querySelector('.card .title').textContent = title;
	document.querySelector('.card p').textContent = location;

	if (image) {
		const reader = new FileReader();
		reader.onload = function(e) {
			document.querySelector('.card img').src = e.target.result;
		}
		reader.readAsDataURL(image);
	}

	const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
	modal.hide();
});
