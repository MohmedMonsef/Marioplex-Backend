/**
 * @api {PUT} /sign_up Create a new account
 * @apiName Create a new account
 * @apiGroup Account
 * @apiDescription
 * 
 * <p style="color:red;">add new user.</p>
 *
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * 
 * @apiHeader (Header)  Content-Type	Required. The content type of the request body: application/json
 * @apiParam (Body Parameters) {string}  username		Required. The display_name of new user
 * @apiParam (Body Parameters) {string}  password		Required. The password of new user
 * @apiParam (Body Parameters) {string}  country		Required. the country of new user
 * @apiParam (Body Parameters) {string}  email  		Required. The email of the user (which is unique).
 * @apiParam (Body Parameters) {string}  gender 		Required. The type of new user ( m:male or f:female).
 * @apiParam (Body Parameters) {string}  birthday		Required. The birthday of a new user
 * 
 * 
 * @apiparam (Response) Format On success, the response body contains the created user object in JSON format and the HTTP status code in the response header is 200 OK or 201 Created. There is also a Location response header giving the Web API endpoint for the new user. On error, the header status code is an error code and the response body contains an error object. Trying to create a user when you do not have the user’s authorization returns error 403 Forbidden.
 */
/**
 * @api {post} /Login Login to Spotify
 * @apiName Login to Spotify
 * @apiGroup Account
 * @apiDescription
 * 
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1>Endpoint</h1> 
 * 
 * 
 * @apiParam (QueryParameters)  email Required. the User e-mail in Spotify Accounts
 * @apiParam (QueryParameters)  password Required. the User Password in Spotify Accounts
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response header contains a JWT </br> On error, the header status code is an error code and the response body contains an error object.
 * 
 * 
 *
 *
 */
/**
 * @api {post} /login/forgetpassword Forget Password
 * @apiName Forget Password
 * @apiGroup Account
 * @apiDescription
 * 
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1>Endpoint</h1> 
 * 
 * 
 * @apiParam (QueryParameters)  email Required. the User e-mail in Spotify Accounts
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body is empty </br> On error, the header status code is an error code and the response body contains an error object.
 * 
 * 
 *
 *
 */

/**
 * @api {post} /LoginFacebook Login to Spotify with Facebook
 * @apiName Login to Spotify with Facebook
 * @apiGroup Account
 * @apiDescription
 * 
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1>Endpoint</h1> 
 * 
 * 
 * @apiParam (QueryParameters)  email Required. the User e-mail in Facebook Accounts
 * @apiParam (QueryParameters)  password Required. the User Password in Facebook Accounts
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response header contains a JWT </br> On error, the header status code is an error code and the response body contains an error object.
 * 
 * 
 *
 *
 */


/**
 * @api {post} me/logout logout 
 * @apiName logout 
 * @apiGroup Account
 * @apiDescription
 * 
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1>Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * @apiParam (QueryParameters) id Required. The User ID in Spotify Accounts
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains a user object </br> On error, the header status code is an error code and the response body contains an error object.
 * 
 * 
 *
 *
 */
/**
 * @api {delete} me/remove  remove account
 * @apiName remove account
 * @apiGroup Account
 * @apiDescription
 * 
 * <p style="color:red;">delete user from spotify.</p>
 *
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * @apiParam (Query Parameters)  id    Required. A user id for the account is wanted to remove  
 */
/**
 * @api {PUT} /promote make user premium
 * @apiName make user premium
 * @apiGroup Account
 * @apiDescription
 * 
 * <p style="color:red;">promote user to premium.</p>
 *
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * @apiParam (Query Parameters)  id    Required. A user id who want to promote
 * apiparam (Query parameters) credit card  Required. A user credit card 
 * @apiparam (Response) Format On success, the response body contains the user_id and credit card and the HTTP status code in the response header is 200 OK or 201 Created. There is also a Location response header giving the Web API endpoint for promote . On error, the header status code is an error code and the response body contains an error object. Trying to promote when you do not have the user’s authorization returns error 403 Forbidden.
 * 
 */
/**
 * @api {put} me/Updata Update User Info
 * @apiName Update User Info
 * @apiGroup Account
 * @apiDescription
 * 
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1>Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 *  @apiParam (BodyParameters)  Display_Name 	Optional. Change the dispaly name for the user
 *  @apiParam (BodyParameters)  Email 	Optional. change the E-mail the user uses to get into Spotify
 *  @apiParam (BodyParameters)  Password 	Optional. change the Password the user uses to get into Spotify
 * @apiParam (BodyParameters)  Country 	Optional. change the Country of the user
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body is empty </br> On error, the header status code is an error code and the response body contains an error object .
 * 
 * 
 *
 *
 */

/**
 * @api {put} me/To-Artist Change User Type to Artist
 * @apiName Change User Type to Artist
 * @apiGroup Account
 * @apiDescription
 * 
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1>Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * @apiParam (QueryParameters) id Required. The User ID in Spotify Accounts
 * @apiParam (BodyParameters) Name Optional. The Artist name shown to public if it's not given the user name will be shown.
 * @apiParam (BodyParameters) Genre Required. The Artist Genre (Pop/Jazz/Rock/...)
 * @apiParam (BodyParameters) Description Required. The Artist's Overview shown to public 
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains a confirmation sent to the Spotify Admins </br> On error, the header status code is an error code and the response body contains an error object.
 * 
 * 
 *
 *
 */

/**
 * @api {PUT} /playlists/{playlist_id} add collaborator
 * @apiName Change a add collaborator
 * @apiGroup Playlist
 * @apiDescription
 * 
 * <p style="color:red;">add a Playlist's collaborator. (The user must, of course, own the playlist.)</p>
 *Note that the request data is a JSON string, not separate fields
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * 
 * @apiParam (Path Parameters)  playlist_id	The Spotify ID for the playlist
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * @apiHeader (Header)  Content-Type	Required if URIs are passed in the request body, otherwise ignored. The content type of the request body: application/json
 *
 *
 * @apiParam (Body Parameters) {array_string}  username   Required . users'name of the user who will be collaborator
 *
 * @apiparam (Response) Format On success the HTTP status code in the response header is 200 OK. On error, the header status code is an error code and the response body contains an error object. Trying to change a playlist when you do not have the user’s authorization returns error 403 Forbidden.
 */
/**
 * @api {PUT} /Artist/update Change a Artist's Details
 * @apiName Change a Artist's  Details
 * @apiGroup Artist
 * @apiDescription
 * 
 * <p style="color:red;">Change a Artist's Details Change a Artist’s name and genre and info .</p>
 *Note that the request data is a JSON string, not separate fields
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * 
 * @apiParam (Path Parameters)  Artist_id	The Spotify ID for the Artist
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * @apiHeader (Header)  Content-Type	Required if URIs are passed in the request body, otherwise ignored. The content type of the request body: application/json
 *
 *
 * @apiParam (Body Parameters) {string}  name	         	   Optional. The new name for the Artist
 * @apiParam (Body Parameters) {string}  genre		           Optional.type of most artist's track 
 * @apiParam (Body Parameters) {string} info		           Optional.all information about this artist
 * @apiparam (Response) Format On success the HTTP status code in the response header is 200 OK. On error, the header status code is an error code and the response body contains an error object. Trying to change an artist when you do not have the user’s authorization returns error 403 Forbidden.
 */
