# import pytest
# from unittest.mock import patch
# from app_booking import AppBooking

# def test_check_availability():
#     # Mock the requests.get function to return a specific response
#     with patch('app_booking.requests.get') as mock_get:
#         mock_response = MagicMock()
#         mock_response.status_code = 200
#         mock_response.json.return_value = {'bookings': []}
#         mock_get.return_value = mock_response

#         # Create an instance of AppBooking and call the check_availability function
#         app_booking = AppBooking(None)
#         result = app_booking.check_availability()

#         # Assert the expected result
#         assert result == {'bookings': []}

#         # Assert that the requests.get function was called with the correct parameters
#         mock_get.assert_called_once_with(
#             'https://api.cal.com/v1/availability',
#             params={
#                 'apiKey': settings.CAL_API_KEY,
#                 'dateFrom': "08/05/2024",
#                 'dateTo': "08/06/2024",
#                 'username': "michael-ali-0nkdtt",
#                 'eventID': '954138'
#             }
#         )