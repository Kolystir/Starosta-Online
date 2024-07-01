$(document).ready(function() {
  $("body").append(`
      <div class="container mt-5">
          <h2>User Settings</h2>
          <form id="userForm">
              <div class="form-group">
                  <label for="email">Email</label>
                  <input type="email" class="form-control" id="email" required>
              </div>
              <div class="form-group">
                  <label for="password">Password</label>
                  <input type="password" class="form-control" id="password" required>
              </div>
              <button type="submit" class="btn btn-primary">Update</button>
          </form>
          <div class="mt-3" id="message"></div>
      </div>
  `);

  $('#userForm').on('submit', function(e) {
      e.preventDefault();
      var email = $('#email').val();
      var password = $('#password').val();
      
      $.ajax({
          url: '/api/user/update/1', // замените на текущий user_id
          type: 'PUT',
          contentType: 'application/json',
          data: JSON.stringify({
              email: email,
              password: password
          }),
          success: function(response) {
              $('#message').text("User updated successfully!").addClass('alert alert-success');
          },
          error: function(xhr, status, error) {
              $('#message').text('An error occurred: ' + error).addClass('alert alert-danger');
          }
      });
  });

  // Timer function
  function startTimer(duration, display) {
      var timer = duration, minutes, seconds;
      setInterval(function () {
          minutes = parseInt(timer / 60, 10);
          seconds = parseInt(timer % 60, 10);
          
          minutes = minutes < 10 ? "0" + minutes : minutes;
          seconds = seconds < 10 ? "0" + seconds : seconds;
          
          display.text(minutes + ":" + seconds);
          
          if (--timer < 0) {
              timer = duration;
          }
      }, 1000);
  }

  // Display timer
  var oneMinute = 60 * 1,
      display = $('#timer');
  startTimer(oneMinute, display);
});