//Album

/**
 * @api {get} /Albums/{id} Get an Album
 * @apiName Get an Album
 * @apiGroup Album
 * @apiDescription
 * 
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1>Endpoint</h1> 
 * 
 * GET https://api.spotify.com/v1/albums/{id}
 * 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * @apiParam (PathParameters)  id Spotify ID for Albums
 * 
 * @apiParam (QueryParameters)  market Optional. An ISO 3166-1 alpha-2 country code or the string from_token. Provide this parameter if you want to apply Track Relinking.
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains an album object in JSON format.</br> On error, the header status code is an error code and the response body contains an error object.
 * 
 * 
 *
 *
 */
/**
 * @api {get} /Albums/{id}/tracks Get an Album's Tracks
 * @apiName Get an Album's Tracks
 * @apiGroup Album
 * @apiDescription
 * 
 * <p style="color:red;">Get Spotify catalog information about an album’s tracks. </br>
 * Optional parameters can be used to limit the number of tracks returned.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * @apiParam (PathParameters)  id Spotify ID for Albums
 * 
 * 
 * @apiParam (QueryParameters)  limit 	Optional. The maximum number of tracks to return. Default: 20. Minimum: 1. Maximum: 50.
 * @apiParam (QueryParameters)  offset 		Optional. The index of the first track to return. Default: 0 (the first object). Use with limit to get the next set of tracks.
 * @apiParam (QueryParameters)  market Optional. An ISO 3166-1 alpha-2 country code or the string from_token. Provide this parameter if you want to apply Track Relinking.
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains</br> an array of simplified track objects (wrapped in a paging object) in JSON format.</br> On error, the header status code is an error code and the response body contains an error object.
 *
 *
 */

/**
* @api {get} /Albums Get Several Albums
* @apiName Get Several Albums
* @apiGroup Album
* @apiDescription
* 
* <p style="color:red;">Get Spotify catalog information for multiple albums identified by their Spotify IDs. </br>
* Optional parameters can be used to limit the number of tracks returned.</p>
*
* 
* <h1>Request Parameters</h1></br></br>
* 
* <h1> Endpoint</h1> 
* 
* 
* @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
* 
* 
* 
* @apiParam (QueryParameters)  ids 	Required. A comma-separated list of the Spotify IDs for the albums. Maximum: 20 IDs.
*  @apiParam (QueryParameters)  market Optional. An ISO 3166-1 alpha-2 country code or the string from_token. Provide this parameter if you want to apply Track Relinking.
* @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains an object whose key is</br> "albums" and whose value is an array of album objects in JSON format.</br></br></br> Objects are returned in the order requested. If an object is not found, a null value is returned in the appropriate position.</br> Duplicate ids in the query will result in duplicate objects in the response.</br> On error, the header status code is an error code and the response body contains an error object.

*
*
*/

//Artist

//new
/**
 * @api {put} Artists/me/Albums Create Album
 * @apiName Create Album
 * @apiGroup Artist
 * @apiDescription
 * <p style="color:red;">Create An Album for the Current Artist .</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * @apiHeader (Header)  Content-type Required. The content type of the request body: application/json
 * @apiParam (BodyParameters)   Name Required. String of the name of the new Album
 * @apiParam (BodyParameters)   Label  Required. String of the Label of the new Album
 * @apiParam (BodyParameters)   Album-type Required.Album, single, or compilation.
 * @apiParam (BodyParameters)   Release-Date Required.Release Date of the new Album
 * @apiParam (BodyParameters)   Available-Markets Required.The markets in which the album is available: ISO 3166-1 alpha-2 country codes.
 * @apiParam (BodyParameters)   Genre Required.A list of the genres used to classify the album.
 * 
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body Contains an Album Object.</br> On error, the header status code is an error code and the response body contains an error object.
 * 
 *
 *
 */
/**
 * @api {get} /Artists/{id}/tracks_ratio Get an Artist's radio ratio
 * @apiName Get an Artist's radio ratio
 * @apiGroup Artist
 * @apiDescription
 * 
 * <p style="color:red;">Get alot of tracks belongs to this artist or tracks in the same artist's genre .</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiParam (PathParameters)  id Spotify ID for Artist
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 *
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains</br>an object whose key is "tracks" and whose value is an array of up to 10 track objects in JSON format.</br> On error, the header status code is an error code and the response body contains an error object.
 */
/**
 * @api {put} Artists/me/Albums/{id}/tracks Create Track
 * @apiName Create Track
 * @apiGroup Artist
 * @apiDescription
 * <p style="color:red;">Create Track for an Album for the Current Artist .</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * @apiHeader (Header)  Content-type Required. The content type of the request body: application/json
 * @apiParam (PathParameters)   id Required. the id of the Album containing the new track
 * @apiParam (BodyParameters)   Name Required. String of the name of the new Album
 * @apiParam (BodyParameters)   URL  Required. The URL for the track
 * @apiParam (BodyParameters)   Track-Number Required.the number of the track on the album
 * @apiParam (BodyParameters)   Preview-URL Optional.A link to a 30 second preview (MP3 format) of the track.
 * @apiParam (BodyParameters)   Available-Markets Required.The markets in which the track is available: ISO 3166-1 alpha-2 country codes.
 * 
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body Contains a Track Object.</br> On error, the header status code is an error code and the response body contains an error object.
 * 
 *
 *
 */

 /**
 * @api {delete} Artists/me/Albums/{id}/tracks Delete Artist's Track
 * @apiName Delete Artist's Track
 * @apiGroup Artist
 * @apiDescription
 * <p style="color:red;">Delete Tracks for an Album for the Current Artist .</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * @apiHeader (Header)  Content-type Required. The content type of the request body: application/json
 * @apiParam (PathParameters)   id Required. the id of the Album containing the deleted track
 * @apiParam (BodyParameters)   tracks 	equired. An array of objects containing Spotify URIs of the tracks to remove. For example: { "tracks": [{ "uri": "spotify:track:4iV5W9uYEdYUVa79Axb7Rh" },{ "uri": "spotify:track:1301WleyT98MSxVHPZCA6M" }] }. A maximum of 100 objects can be sent at once.
 * 
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body is empty.</br> On error, the header status code is an error code and the response body contains an error object.
 * 
 *
 *
 */
//end new

/**
 * @api {get} /Artists/{id} Get an Artist
 * @apiName Get an Artist
 * @apiGroup Artist
 * @apiDescription
 * <p style="color:red;">Get Spotify catalog information for a single artist identified by their unique Spotify ID.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * @apiParam (PathParameters)  id Spotify ID for the Artist
 * 
 * 
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains an artist object in JSON format.</br> On error, the header status code is an error code and the response body contains an error object.
 * 
 *
 *
 */
/**
 * @api {get} /Artists/{id}/Albums Get an Artist's Albums
 * @apiName Get an Artist's Albums
 * @apiGroup Artist
 * @apiDescription
 * 
 * <p style="color:red;">Get Spotify catalog information about an artist’s albums.</br> Optional parameters can be specified in the query string to filter and sort the response.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * @apiParam (PathParameters)  id Spotify ID for Albums
 * 
 * 
 * @apiParam (QueryParameters)  include_groups 	Optional. A comma-separated list of keywords that will be used to filter the response.</br> If not supplied, all album types will be returned. Valid values are:</br>
* - album </br>
* - single </br>
* - appears_on </br>
* - compilation </br>
* For example:<br> include_groups=album,single.
 * @apiParam (QueryParameters)  country  	Optional. An ISO 3166-1 alpha-2 </br> country code or the string from_token. </br>
* Supply this parameter to limit the response to one particular geographical market.</br> For example, for albums available in Sweden: country=SE.
* </br>If not given, results will be returned for all countries and you are likely to get duplicate results per album,</br> one for each country in which the album is available!
 * @apiParam (QueryParameters)  limit 	Optional. The number of album objects to return.</br> Default: 20. Minimum: 1. Maximum: 50.</br> For example: limit=2
* @apiParam (QueryParameters)  offset 		Optional. The index of the first album to return.</br> Default: 0 (i.e., the first album).</br> Use with limit to get the next set of albums.
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body </br>contains an array of simplified album objects (wrapped in a paging object) in JSON format.</br> On error, the header status code is an error code and the response body contains an error object.

 */

/**
 * @api {get} /Artists/{id}/top-tracks Get an Artist's Top Tracks
 * @apiName Get an Artist's Top Tracks
 * @apiGroup Artist
 * @apiDescription
 * 
 * <p style="color:red;">Get Spotify catalog information about an artist’s top tracks by country.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiParam (PathParameters)  id Spotify ID for Albums
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 * 
 *  @apiParam (QueryParameters)  country Required. An ISO 3166-1 alpha-2 country code or the string from_token.
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains</br>an object whose key is "tracks" and whose value is an array of up to 10 track objects in JSON format.</br> On error, the header status code is an error code and the response body contains an error object.
 */

/**
 * @api {get} /Artists/{id}/related-artists Get an Artist's Related Artists
 * @apiName Get an Artist's Related Artists
 * @apiGroup Artist
 * @apiDescription
 * 
 * <p style="color:red;">Get Spotify catalog information about artists similar to a given artist.</br> Similarity is based on analysis of the Spotify community’s listening history.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiParam (PathParameters)  id Spotify ID for Albums
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains</br> an object whose key is "artists" and whose value is an array of up to 20 artist objects in JSON format.</br> On error, the header status code is an error code and the response body contains an error object.
 *
 *
 */

/**
 * @api {get} /Artists Get Several Artists
 * @apiName Get Several Artists
 * @apiGroup Artist
 * @apiDescription
 * 
 * <p style="color:red;">Get Spotify catalog information for several artists based on their Spotify IDs.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 * 
 * @apiParam (QueryParameters)  ids 		Required. A comma-separated list of the Spotify IDs for the artists. Maximum: 50 IDs.
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains an object</br> whose key is "artists" and whose value is an array of artist objects in JSON format.</br></br></br> Objects are returned in the order requested. If an object is not found, a null value is returned in the appropriate position.</br> Duplicate ids in the query will result in duplicate objects in the response.</br> On error, the header status code is an error code and the response body contains an error object.
 */



//Browse

/**
 * @api {get} /browse/categories/{category_id} Get a Category
 * @apiName Get a Category
 * @apiGroup Browse
 * @apiDescription
 * <p style="color:red;">Get a single category used to tag items in Spotify (on, for example, the Spotify player’s “Browse” tab).</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * @apiParam (PathParameters)  category_id 	The Spotify category ID for the category.
 * 
 *  @apiParam (QueryParameters)  country  		Optional. A country: an ISO 3166-1 alpha-2 country code.</br> Provide this parameter to ensure that the category exists for a particular country.
 * @apiParam (QueryParameters)  locale 	Optional. The desired language,</br> consisting of an ISO 639-1 language code and an ISO 3166-1 alpha-2 country code,</br> joined by an underscore. For example: es_MX, meaning "Spanish (Mexico)".</br> Provide this parameter if you want the category strings returned in a particular language.</br> Note that, if locale is not supplied, or if the specified language is not available,</br> the category strings returned will be in the Spotify default language (American English).
 * 
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains a category object in JSON format. </br>On error, the header status code is an error code and the response body contains an error object.
 *
 */

/**
 * @api {get} /browse/categories/{category_id}/playlists Get a Category's Playlists
 * @apiName Get a Category's Playlists
 * @apiGroup Browse
 * @apiDescription
 * <p style="color:red;">Get a list of Spotify playlists tagged with a particular category.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * @apiParam (PathParameters)  category_id 	The Spotify category ID for the category.
 * 
 *  @apiParam (QueryParameters)  country  			Optional. A country: an ISO 3166-1 alpha-2 country code.
 * @apiParam (QueryParameters)  limit 	Optional. The maximum number of items to return.</br> Default: 20. Minimum: 1. Maximum: 50.
 * @apiParam (QueryParameters)  offset 	Optional. The index of the first item to return.</br> Default: 0 (the first object).</br> Use with limit to get the next set of items.
 *@apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains</br> an array of simplified playlist objects (wrapped in a paging object) in JSON format.</br> On error, the header status code is an error code and the response body contains an error object.
 *
 */

/**
 * @api {get} /browse/categories Get a List of Categories
 * @apiName Get a List of Categories
 * @apiGroup Browse
 * @apiDescription
 * <p style="color:red;">Get a list of categories used to tag items in Spotify (on, for example, the Spotify player’s “Browse” tab).</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 *  @apiParam (QueryParameters)  country  			Optional. A country: an ISO 3166-1 alpha-2 country code. Provide this parameter </br> if you want to narrow the list of returned categories to those relevant to a particular country.</br> If omitted, the returned items will be globally relevant.
 * @apiParam (QueryParameters)  locale 		Optional. The desired language, consisting of an ISO 639-1 language code and an ISO 3166-1 alpha-2 country code</br> , joined by an underscore. For example: es_MX, meaning “Spanish (Mexico)”. </br> Provide this parameter if you want the category metadata returned in a particular language.</br>  Note that, if locale is not supplied, or if the specified language is not available,</br>  all strings will be returned in the Spotify default language (American English). The locale parameter,</br>  combined with the country parameter, may give odd results if not carefully matched.</br> For example country=SE&locale=de_DE will return a list of categories relevant to Sweden but as German language strings.
 * @apiParam (QueryParameters)  limit  Optional. The maximum number of categories to return.</br> Default: 20. Minimum: 1. Maximum: 50.
 * @apiParam (QueryParameters)  offset 	Optional. The index of the first item to return.</br> Default: 0 (the first object). Use with limit to get the next set of categories. 
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains</br> an object with a categories field, with an array of category objects (wrapped in a paging object) in JSON format.</br> On error, the header status code is an error code and the response body contains an error object.
 */

/**
 * @api {get} /browse/featured-playlists Get a List of Featured Playlists
 * @apiName Get a List of Featured Playlists
 * @apiGroup Browse
 * @apiDescription
 * <p style="color:red;">Get a list of categories used to tag items in Spotify (on, for example, the Spotify player’s “Browse” tab).</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 *  @apiParam (QueryParameters)  country  			Optional. A country: an ISO 3166-1 alpha-2 country code. Provide this parameter </br> if you want to narrow the list of returned categories to those relevant to a particular country.</br> If omitted, the returned items will be globally relevant.
 * @apiParam (QueryParameters)  locale 		Optional. The desired language, consisting of an ISO 639-1 language code and an ISO 3166-1 alpha-2 country code</br> , joined by an underscore. For example: es_MX, meaning “Spanish (Mexico)”. </br> Provide this parameter if you want the category metadata returned in a particular language.</br>  Note that, if locale is not supplied, or if the specified language is not available,</br>  all strings will be returned in the Spotify default language (American English). The locale parameter,</br>  combined with the country parameter, may give odd results if not carefully matched.</br> For example country=SE&locale=de_DE will return a list of categories relevant to Sweden but as German language strings.
 * @apiParam (QueryParameters)  limit  Optional. The maximum number of categories to return.</br> Default: 20. Minimum: 1. Maximum: 50.
 * @apiParam (QueryParameters)  offset 	Optional. The index of the first item to return.</br> Default: 0 (the first object). Use with limit to get the next set of categories. 
 * @apiParam (Response)  Format  On success, </br>the HTTP status code in the response header is 200 OK</br> and the response body contains a message and a playlists object.</br> The playlists object contains an array of simplified playlist objects</br> (wrapped in a paging object) in JSON format. On error,</br> the header status code is an error code and the response body contains an error object.</br></br></br></br> Once you have retrieved the list of playlist objects,</br> you can use Get a Playlist and Get a Playlist’s Tracks to drill down further.
 */

/**
 * @api {get} /browse/new-releases Get a List of New Releases
 * @apiName Get a List of New Releases
 * @apiGroup Browse
 * @apiDescription
 * <p style="color:red;">Get a list of new album releases featured in Spotify (shown, for example, on a Spotify player’s “Browse” tab).</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 *  @apiParam (QueryParameters)  country  			Optional. A country: an ISO 3166-1 alpha-2 country code.</br> Provide this parameter if you want the list of returned items to be relevant to a particular country.</br> If omitted, the returned items will be relevant to all countries.
 * @apiParam (QueryParameters)  limit  	Optional. The maximum number of items to return. Default: 20. Minimum: 1. Maximum: 50.
 * @apiParam (QueryParameters)  offset 		Optional. The index of the first item to return. Default: 0 (the first object). Use with limit to get the next set of items. 
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains a message and analbums object.</br> The albums object contains an array of simplified album objects (wrapped in a paging object) in JSON format.</br> On error, the header status code is an error code and the response body contains an error object.</br></br></br> Once you have retrieved the list, you can use Get an Album’s Tracks to drill down further.</br></br> The results are returned in an order reflected within the Spotify clients, and therefore may not be ordered by date.
 */

/**
 * @api {get} /recommendations Get Recommendations Based on Seeds
 * @apiName Get Recommendations Based on Seeds
 * @apiGroup Browse
 * @apiDescription
 * <p style="color:red;">Create a playlist-style listening experience based on seed artists, tracks and genres.</p>
 *</br>
 *<p>Recommendations are generated based on the available information for a given seed entity and matched against similar artists and tracks.</br></br> If there is sufficient information about the provided seeds, a list of tracks will be returned together with pool size details.</br></br> For artists and tracks that are very new or obscure there might not be enough data to generate a list of tracks. </p>
 * 
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 *  @apiParam (QueryParameters)  limit  				Optional. The target size of the list of recommended tracks.</br> For seeds with unusually small pools or when highly restrictive filtering is applied,</br> it may be impossible to generate the requested number </br>of recommended tracks. Debugging information for </br>such cases is available in the response.</br> Default: 20. Minimum: 1. Maximum: 100.
 * @apiParam (QueryParameters)  market  		Optional. An ISO 3166-1 alpha-2 country code or the string from_token.</br> Provide this parameter if you want to apply Track Relinking.</br> Because min, max and target are applied to pools before relinking,</br> the generated results may not precisely match the filters applied. Original,</br> non-relinked tracks are available via the linked_from attribute of the relinked track response.
 * @apiParam (QueryParameters)  max 			Optional. Multiple values. For each tunable track attribute,</br> a hard ceiling on the selected track attribute’s value can be provided.</br> See tunable track attributes below for the list of available options.</br> For example, max_instrumentalness=0.35 would filter out most tracks that are likely</br> to be instrumental. 
 * @apiParam (QueryParameters)  min 			Optional. Multiple values. For each tunable track attribute,</br> a hard floor on the selected track attribute’s value can be provided.</br> See tunable track attributes below for the list of available options.</br> For example, min_tempo=140 would restrict results</br> to only those tracks with a tempo of greater than 140 beats per minute. 
 * @apiParam (QueryParameters)  seed_artists  		A comma separated list of Spotify IDs for seed artists.</br> Up to 5 seed values may be provided in any combination of seed_artists, </br>seed_tracks and seed_genres.
 *  @apiParam (QueryParameters)  seed_genres  			A comma separated list of any genres in the set of available genre seeds.</br> Up to 5 seed values may be</br> provided in any combination of seed_artists, seed_tracks and seed_genres.
 * @apiParam (QueryParameters)  seed_tracks  			A comma separated list of Spotify IDs for a seed track.</br> Up to 5 seed values may be provided in</br> any combination of seed_artists, seed_tracks and seed_genres.
 * @apiParam (QueryParameters)  target  		Optional. Multiple values. For each of the tunable track attributes (below)</br> a target value may be provided.</br> Tracks with the attribute values nearest to the target values will be preferred. For example, you might request target_energy=0.6 and target_danceability=0.8. All target values will be weighed equally in ranking results.
 * 
 * 
 * 
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains a recommendations response object in JSON format.
 */



//Follow

/**
 * @api {get} /me/following/contains Check if Current User Follows Artists or Users
 * @apiName Check if Current User Follows Artists or Users
 * @apiGroup Follow
 * @apiDescription
 * <p style="color:red;">Check to see if the current user is following one or more artists or other Spotify users.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 *
 * @apiHeader (Header)  Authorization 	Required. A valid access token from the Spotify Accounts service</br>The access token must have been issued on behalf of the current user.</br> Getting details of the artists or users the current user follows requires authorization of the user-follow-read scope.
 * 
 * 
 *  @apiParam (QueryParameters)  type  		Required. The ID type: either artist or user.
 * @apiParam (QueryParameters)  ids 		Required. A comma-separated list of the artist or the user Spotify IDs to check.</br> For example: ids=74ASZWbe4lXaubB36ztrGX,08td7MxkoHQkXnWAYD8d6Q. A maximum of 50 IDs can be sent in one request.
 * 
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body</br> contains a JSON array of true or false values, in the same order in which the ids were specified.</br> On error, the header status code is an error code and the response body contains an error object.
 */

/**
 * @api {get} /playlists/{playlist_id}/followers/contains  Check if Users Follow a Playlist
 * @apiName Check if Users Follow a Playlist
 * @apiGroup Follow
 * @apiDescription
 * <p style="color:red;">Check to see if one or more Spotify users are following a specified playlist.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * 
 * @apiHeader (Header)  Authorization Required. Required. A valid access token from the Spotify Accounts service.
 * Following a playlist can be done publicly or privately.</br> Checking if a user publicly follows a playlist doesn’t require any scopes;</br> if the user is publicly following the playlist, this endpoint returns true.
 * Checking if the user is privately following a playlist is only possible for the current user</br> when that user has granted access to the playlist-read-private scope.
 * 
 * @apiParam (PathParameters)  playlist_id 		The Spotify ID of the playlist.
 * 
 *  @apiParam (QueryParameters)  ids  				Required. A comma-separated list of Spotify User IDs ;</br> the ids of the users that you want to check to see if they follow the playlist. Maximum: 5 ids.
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response </br>body contains a JSON array oftrue or false values, in the same order in which the ids were specified.</br> On error, the header status code is an error code and the response body contains an error object.
 */

/**
 * @api {put} /me/following Follow Artists or Users
 * @apiName Follow Artists or Users
 * @apiGroup Follow
 * @apiDescription
 * <p style="color:red;">Add the current user as a follower of one or more artists or other Spotify users.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service.</br> The access token must have been issued on behalf of the current user.</br> Modifying the list of artists or users the current user follows requires authorization of the user-follow-modify scope
 * @apiHeader (Header)  Content-Type Required if IDs are passed in the request body,</br> otherwise ignored. The content type of the request body: application/json.
 * 
 *  @apiParam (QueryParameters)  type  		Required. The ID type: either artist or user.
 * @apiParam (QueryParameters)  id 		Optional. A comma-separated list of the artist or the user Spotify IDs.</br> For example: ids=74ASZWbe4lXaubB36ztrGX,08td7MxkoHQkXnWAYD8d6Q. A maximum of 50 IDs can be sent in one request.
 * @apiParam (BodyParameters)  ids   Optional. A JSON array of the artist or user Spotify IDs.</br> For example: {ids:["74ASZWbe4lXaubB36ztrGX", "08td7MxkoHQkXnWAYD8d6Q"]}.</br> A maximum of 50 IDs can be sent in one request.</br> Note: if the ids parameter is present in the query string, any IDs listed here in the body will be ignored.
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 204 No Content and the response body is empty.</br> On error, the header status code is an error code and the response body contains an error object.
 */

/**
 * @api {put} /playlists/{playlist_id}/followers Follow a Playlist
 * @apiName Follow a Playlist
 * @apiGroup Follow
 * @apiDescription
 * <p style="color:red;">Add the current user as a follower of a playlist.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization 	Required. A valid access token from the Spotify Accounts service: see the Web API Authorization Guide for details.</br> The access token must have been issued on behalf of the current user.</br>Following a playlist publicly requires authorization of the playlist-modify-public scope; following it privately requires the playlist-modify-private scope. 
 * @apiHeader (Header)  Content-Type Required. The content type of the request body: application/json
 * 
 * 
 *  @apiParam (PathParameters)  playlist_id  			The Spotify ID of the playlist. Any playlist can be followed,</br> regardless of its public/private status, as long as you know its playlist ID.
 * @apiParam (BodyParameters)   public   	Optional. (Boolean) Defaults to true. If true the playlist will be included in user’s public playlists,</br> if false it will remain private. To be able to follow playlists privately,</br> the user must have granted the playlist-modify-private scope.
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body is empty.</br> On error, the header status code is an error code and the response body contains an error object.
 */



/**
 * @api {get} /me/following?type=artist Get User's Followed Artists
 * @apiName Get User's Followed Artists
 * @apiGroup Follow
 * @apiDescription
 * <p style="color:red;">Get the current user’s followed artists.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service.</br> The access token must have been issued on behalf of the current user. </br>Getting details of the artists or users the current user follows requires authorization of the user-follow-read scope.
 * 
 * 
 *  @apiParam (QueryParameters)  type  				Required. The ID type: currently only artist is supported.
 * @apiParam (QueryParameters)  limit  	Optional. The maximum number of items to return. Default: 20. Minimum: 1. Maximum: 50.
 * @apiParam (QueryParameters)  after 			Optional. The last artist ID retrieved from the previous request. 
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains an artists object. The artists object in turn contains a cursor-based paging object of Artists.</br> On error, the header status code is an error code and the response body contains an error object.
 */

/**
 * @api {delete} /me/following Unfollow Artists or Users
 * @apiName Unfollow Artists or Users
 * @apiGroup Follow
 * @apiDescription
 * <p style="color:red;">Remove the current user as a follower of one or more artists or other Spotify users.</p>
 * 
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization 	Required. A valid access token from the Spotify Accounts service.</br> The access token must have been issued on behalf of the current user.</br> Modifying the list of artists or users the current user follows requires authorization of the user-follow-modify scope.
 * @apiHeader (Header)  Content-Type 	Required if IDs are passed in the request body, otherwise ignored.</br> The content type of the request body: application/json.
 * 
 *  @apiParam (QueryParameters)  type  				Required. The ID type: either artist or user.
 * @apiParam (QueryParameters)  ids  			Optional. A comma-separated list of the artist or the user Spotify IDs.</br> For example: ids=74ASZWbe4lXaubB36ztrGX,08td7MxkoHQkXnWAYD8d6Q. A maximum of 50 IDs can be sent in one request.
 * @apiParam (BodyParameters)  ids 	Optional. A JSON array of the artist or user Spotify IDs. For example: {ids:["74ASZWbe4lXaubB36ztrGX", "08td7MxkoHQkXnWAYD8d6Q"]}.</br> A maximum of 50 IDs can be sent in one request.</br> Note: if the ids parameter is present in the query string, any IDs listed here in the body will be ignored. 
 * 
 * 
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 204 No Content and the response body is empty.</br> On error, the header status code is an error code and the response body contains an error object.
 */
//like Tracks
/**
 * @api {put} /me/like like track
 * @apiName like track
 * @apiGroup like
 * @apiDescription
 * <p style="color:red;">Add the current user  like this track.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service.</br> The access token must have been issued on behalf of the current user.</br> Modifying the list of artists or users the current user follows requires authorization of the user-follow-modify scope
 * @apiHeader (Header)  Content-Type Required if IDs are passed in the request body,</br> otherwise ignored. The content type of the request body: application/json.
 * 
 * @apiParam (QueryParameters)  id 		require.require.  track Spotify ID .
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 204 No Content and the response body is empty.</br> On error, the header status code is an error code and the response body contains an error object.
 */
/**
 * @api {delete} /me/unlike unlike track
 * @apiName unlike track
 * @apiGroup like
 * @apiDescription
 * <p style="color:red;">Add the current user  unlike this track.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service.</br> The access token must have been issued on behalf of the current user.</br> Modifying the list of artists or users the current user follows requires authorization of the user-follow-modify scope
 * @apiHeader (Header)  Content-Type Required if IDs are passed in the request body,</br> otherwise ignored. The content type of the request body: application/json.
 * 
 * @apiParam (QueryParameters)  id 		require.  track Spotify ID .
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 204 No Content and the response body is empty.</br> On error, the header status code is an error code and the response body contains an error object.
 */

//public

/**
 * @api {delete} /playlists/{playlist_id}/followers Unfollow a Playlist
 * @apiName Unfollow a Playlist
 * @apiGroup Follow
 * @apiDescription
 * <p style="color:red;">Remove the current user as a follower of a playlist.</p>
 * 
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization 		Required. A valid access token from the Spotify Accounts service.</br> The access token must have been issued on behalf of the user.</br>Unfollowing a publicly followed playlist for a user requires authorization of the playlist-modify-public scope; unfollowing a privately followed playlist requires the playlist-modify-private scope.
 * 
 *  @apiParam (PathParameter)  playlist_id  		The Spotify ID of the playlist that is to be no longer followed.
 * 
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body is empty.</br> On error, the header status code is an error code and the response body contains an error object.
 */

//Library

/**
 * @api {get} /me/albums/contains Check User's Saved Albums
 * @apiName Check User's Saved Albums
 * @apiGroup Library
 * @apiDescription
 * <p style="color:red;">Check if one or more albums is already saved in the current Spotify user’s ‘Your Music’ library.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization 		Required. A valid access token from the Spotify Accounts service: see the Web API Authorization Guide for details. </br>The user-library-read scope must have been authorized by the user.
 * 
 * 
 * @apiParam (QueryParameters)  ids 			Required. A comma-separated list of the Spotify IDs for the albums. Maximum: 50 IDs.
 * 
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains</br> a JSON array of true or false values, in the same order in which the ids were specified. </br>On error, the header status code is an error code and the response body contains an error object.
 */

/**
 * @api {get} /me/tracks/contains  Check User's Saved Tracks
 * @apiName Check User's Saved Tracks
 * @apiGroup Library
 * @apiDescription
 * <p style="color:red;">Check if one or more tracks is already saved in the current Spotify user’s ‘Your Music’ library.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service.</br> The user-library-read scope must have been authorized by the user.

 * 
 *  @apiParam (QueryParameters)  ids  					Required. A comma-separated list of the Spotify IDs for the tracks. Maximum: 50 IDs.
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains</br> a JSON array of true or false values, in the same order in which the ids were specified. </br>On error, the header status code is an error code and the response body contains an error object.
 */

/**
 * @api {get} /me/albums Get Current User's Saved Albums
 * @apiName Get Current User's Saved Albums
 * @apiGroup Library
 * @apiDescription
 * <p style="color:red;">Get a list of the albums saved in the current Spotify user’s ‘Your Music’ library.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization 	Required. A valid access token from the Spotify Accounts service. </br>The user-library-read scope must have been authorized by the user.
 * 
 *  @apiParam (QueryParameters)  limit  			Optional. The maximum number of objects to return. Default: 20. Minimum: 1. Maximum: 50.
 * @apiParam (QueryParameters)  offset 			Optional. The index of the first object to return.</br> Default: 0 (i.e., the first object). Use with limit to get the next set of objects.
 * @apiParam (QueryParameters)  market   	Optional. An ISO 3166-1 alpha-2 country code</br> or the string from_token. Provide this parameter if you want to apply Track Relinking.
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains an array of </br>album objects (wrapped in a paging object) in JSON format. Each album object is accompanied</br> by a timestamp (added_at) to show when it was added. There is also an etag in the header that can be used in future conditional requests.</br> On error, the header status code is an error code and the response body contains an error object.
 */

/**
 * @api {get} /me/tracks Get a User's Saved Tracks
 * @apiName Get a User's Saved Tracks
 * @apiGroup Library
 * @apiDescription
 * <p style="color:red;">Get a list of the songs saved in the current Spotify user’s ‘Your Music’ library.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization 		Required. A valid access token from the Spotify Accounts service.</br> The user-library-read scope must have been authorized by the user. 
 * 
 * 
 *  @apiParam (QueryParameters)  limit  			Optional. The maximum number of objects to return. Default: 20. Minimum: 1. Maximum: 50.
 * @apiParam (QueryParameters)   offset   		Optional. The index of the first object to return.</br> Default: 0 (i.e., the first object). Use with limit to get the next set of objects.
 * @apiParam (QueryParameters)   market   	Optional. An ISO 3166-1 alpha-2 country code or the string from_token.</br> Provide this parameter if you want to apply Track Relinking.
 *
 *  @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body</br> contains an array of saved track objects (wrapped in a paging object) in JSON format.</br> On error, the header status code is an error code and the response body contains an error object.
 */



/**
 * @api {delete} /me/albums?ids={ids} Remove Albums for Current User
 * @apiName Remove Albums for Current User
 * @apiGroup Library
 * @apiDescription
 * <p style="color:red;">Remove one or more albums from the current user’s ‘Your Music’ library.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization 	Required. A valid access token from the Spotify Accounts service.</br>Modification of the current user’s “Your Music” collection requires authorization of the user-library-modify scope.
 * @apiHeader (Header)  content-type 	Required if the IDs are passed in the request body, otherwise ignored.</br> The content type of the request body: application/json
 * 
 *  @apiParam (QueryParameters)  ids  					Optional. A comma-separated list of the Spotify IDs.</br> For example: ids=4iV5W9uYEdYUVa79Axb7Rh,1301WleyT98MSxVHPZCA6M. Maximum: 50 IDs.
 * @apiParam (BodyParameters)  ids 			Optional. A JSON array of the Spotify IDs. For example: ["4iV5W9uYEdYUVa79Axb7Rh", "1301WleyT98MSxVHPZCA6M"] </br>A maximum of 50 items can be specified in one request. </br>Note: if the ids parameter is present in the query string, any IDs listed here in the body will be ignored. 
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 Success.</br> On error, the header status code is an error code and the response body contains an error object. </br>Trying to remove an album when you do not have the user’s authorization returns error 403 Forbidden.
 */

/**
 * @api {delete} /me/tracks Remove User's Saved Tracks
 * @apiName Remove User's Saved Tracks
 * @apiGroup Library
 * @apiDescription
 * <p style="color:red;">Remove one or more tracks from the current user’s ‘Your Music’ library.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization 		Required. A valid access token from the Spotify Accounts service.</br>Modification of the current user’s “Your Music” collection requires authorization of the user-library-modify scope.
 * @apiHeader (Header)  content-type 	Required if the IDs are passed in the request body, otherwise ignored.</br> The content type of the request body: application/json
 * 
 *  @apiParam (QueryParameters)  ids  					Optional. A comma-separated list of the Spotify IDs.</br> For example: ids=4iV5W9uYEdYUVa79Axb7Rh,1301WleyT98MSxVHPZCA6M. Maximum: 50 IDs.
 * @apiParam (BodyParameters)  ids 			Optional. A JSON array of the Spotify IDs.</br> For example: ["4iV5W9uYEdYUVa79Axb7Rh", "1301WleyT98MSxVHPZCA6M"]</br>A maximum of 50 items can be specified in one request. </br>Note: if the ids parameter is present in the query string, any IDs listed here in the body will be ignored. 
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 Success. On error,</br> the header status code is an error code and the response body contains an error object. </br>Trying to remove a track when you do not have the user’s authorization returns error 403 Forbidden.
 */

/**
 * @api {put} /me/albums?ids={ids} Save Albums for Current User
 * @apiName Save Albums for Current User
 * @apiGroup Library
 * @apiDescription
 * <p style="color:red;">Save one or more albums to the current user’s ‘Your Music’ library.</p>
 * 
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization 		Required. A valid access token from the Spotify Accounts service.</br>Modification of the current user’s “Your Music” collection requires authorization of the user-library-modify scope.
 * @apiHeader (Header)  Content-Type 	Required if the IDs are passed in the request body, otherwise ignored.</br> The content type of the request body: application/json
 * 
 * @apiParam (QueryParameters)  ids  				Optional. A comma-separated list of the Spotify IDs.</br> For example: ids=4iV5W9uYEdYUVa79Axb7Rh,1301WleyT98MSxVHPZCA6M. Maximum: 50 IDs.
 * @apiParam (BodyParameters)  ids 	Optional. A JSON array of the Spotify IDs.</br> For example: ["4iV5W9uYEdYUVa79Axb7Rh", "1301WleyT98MSxVHPZCA6M"]</br>A maximum of 50 items can be specified in one request.</br> Note: if the ids parameter is present in the query string, any IDs listed here in the body will be ignored. 
 * 
 * 
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 201 Created.</br> On error, the header status code is an error code and the response body contains an error object. </br>Trying to add an album when you do not have the user’s authorization returns error 403 Forbidden.
 */

/**
 * @api {put} /me/tracks Save Tracks for User
 * @apiName Save Tracks for User
 * @apiGroup Library
 * @apiDescription
 * <p style="color:red;"> Save one or more tracks to the current user’s ‘Your Music’ library.</p>
 * 
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization 		Required. A valid access token from the Spotify Accounts service.</br>Modification of the current user’s “Your Music” collection requires authorization of the user-library-modify scope.
 * @apiHeader (Header)  Content-Type 	Required if the IDs are passed in the request body, otherwise ignored.</br> The content type of the request body: application/json
 * 
 * @apiParam (QueryParameters)  ids  				Optional. A comma-separated list of the Spotify IDs. </br>For example: ids=4iV5W9uYEdYUVa79Axb7Rh,1301WleyT98MSxVHPZCA6M. Maximum: 50 IDs.
 * @apiParam (BodyParameters)  ids 	Optional. A JSON array of the Spotify IDs. </br>For example: {ids:["4iV5W9uYEdYUVa79Axb7Rh", "1301WleyT98MSxVHPZCA6M"]}</br>A maximum of 50 items can be specified in one request. Note: if the ids parameter is present in the query string, any IDs listed here in the body will be ignored. 
 * 
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK. </br>On error, the header status code is an error code and the response body contains an error object. </br>Trying to add a track when you do not have the user’s authorization, or when you have over 10.000 tracks in Your Music, returns error 403 Forbidden.
 */


//Personalization

/**
 * @api {get} /me/top/{type} Get a User's Top Artists and Tracks
 * @apiName Get a User's Top Artists and Tracks
 * @apiGroup Personalization
 * @apiDescription
 * <p style="color:red;">Get the current user’s top artists or tracks based on calculated affinity.</p>
 * 
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization 			Required. A valid access token from the Spotify Accounts service.</br> The access token must have been issued on behalf of the current user.</br>Getting details of a user’s top artists and tracks requires authorization of the user-top-read scope.
 * @apiParam (PathParameters)  type 		The type of entity to return. Valid values: artists or tracks. 
 * 
 * @apiParam (QueryParameters)  limit  				Optional. The number of entities to return. Default: 20. Minimum: 1. Maximum: 50. For example: limit=2
 * @apiParam (QueryParameters)  offset  					Optional. The index of the first entity to return.</br> Default: 0 (i.e., the first track). Use with limit to get the next set of entities.
 * @apiParam (QueryParameters)  time-range  					Optional. Over what time frame the affinities are computed.</br> Valid values: long_term (calculated from several years of data and including all new data as it becomes available),</br> medium_term (approximately last 6 months), short_term (approximately last 4 weeks). Default: medium_term.
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains a paging object of Artists or Tracks. </br>On error, the header status code is an error code and the response body contains an error object.
 */

//Player


/**
 * @api {get} /player Get Information About The User's Current Playback
 * @apiName Get Information About The User's Current Playback
 * @apiGroup Player
 * @apiDescription
 * 
 * <p style="color:red;">Get information about the user’s current playback state, including track, track progress, and active device.</br> Optional parameters can be specified in the query string to filter and sort the response.</p>
 *
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * @apiParam (Query Parameters)  market 	Optional. An ISO 3166-1 alpha-2 country code or the string from_token.
 *
 * @apiparam (Response) Format A successful request will return a 200 OK response code with a json payload that contains information about the current playback. The information returned is for the last known state, which means an inactive device could be returned if it was the last one to execute playback. When no available devices are found, the request will return a 200 OK response but with no data populated.
 */
/**
 * @api {get} /player/currently-playing Get the User's Currently Playing Track
 * @apiName Get the User's Currently Playing Track
 * @apiGroup Player
 * @apiDescription
 * 
 * <p style="color:red;">Get the object currently being played on the user’s Spotify account.</p>
 *
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * @apiParam (Query Parameters)  market 	Optional. An ISO 3166-1 alpha-2 country code or the string from_token.
 *
 * @apiparam (Response) Format A successful request will return a 200 OK response code with a json payload that contains information about the currently playing track and context (see below). The information returned is for the last known state, which means an inactive device could be returned if it was the last one to execute playback. When no available devices are found, the request will return a 200 OK response but with no data populated. When no track is currently playing, the request will return a 204 NO CONTENT response with no payload. If private session is enabled the response will be a 204 NO CONTENT with an empty payload.
 */

/**
 * @api {get} /player/recently-played Get Current User's Recently Played Tracks
 * @apiName Get Current User's Recently Played Tracks.
 * @apiGroup Player
 * @apiDescription
 * 
 * <p style="color:red;">Get tracks from the current user’s recently played tracks.</p>
 * 
 * 
 *Returns the most recent 50 tracks played by a user. Note that a track currently playing will not be visible in play history until it has completed. A track must be played for more than 30 seconds to be included in play history.
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 *
 *  @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 *  
 * 
 * @apiParam (Query Parameters)  limit  Optional. The maximum number of items to return. Default: 20. Minimum: 1. Maximum: 50.
 * @apiParam (Query Parameters)  after  Optional. A Unix timestamp in milliseconds. Returns all items after (but not including) this cursor position. If after is specified, before must not be specified.
 * @apiParam (Query Parameters)  before Optional. A Unix timestamp in milliseconds. Returns all items before (but not including) this cursor position. If before is specified, after must not be specified.
 * 
 * 
 *
 * @apiparam (Response) Format On success, the HTTP status code in the response header is 200 OK and the response body contains an array of play history objects (wrapped in a cursor-based paging object) in JSON format. The play history items each contain the context the track was played from (e.g. playlist, album), the date and time the track was played, and a track object (simplified). On error, the header status code is an error code and the response body contains an error object. If private session is enabled the response will be a 204 NO CONTENT with an empty payload.
 * 
 */

/**
 * @api {PUT} /player/pause  Pause a User's Playback
 * @apiName Pause a User's Playback
 * @apiGroup Player
 * @apiDescription
 * 
 * <p style="color:red;">Pause playback on the user’s account.</br> 
 * 
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 *
 * @apiparam (Response) Format A completed request will return a 204 NO CONTENT response code, and then issue the command to the player. Due to the asynchronous nature of the issuance of the command, you should use the Get Information About The User’s Current Playback endpoint to check that your issued command was handled correctly by the player. When performing an action that is restricted, 404 NOT FOUND or 403 FORBIDDEN will be returned together with a player error message. For example, if there are no active devices found, the request will return 404 NOT FOUND response code and the reason NO_ACTIVE_DEVICE, or, if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned together with the PREMIUM_REQUIRED reason.
 * 
 */

/**
 * @api {PUT} /player Seek To Position In Currently Playing Track
 * @apiName Seek To Position In Currently Playing Track
 * @apiGroup Player
 * @apiDescription
 * 
 * <p style="color:red;">Seeks to the given position in the user’s currently playing track.</p>
 *
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 * 
 * @apiParam (Query Paramaters)  position_ms	 Required. The position in milliseconds to seek to. Must be a positive number. Passing in a position that is greater than the length of the track will cause the player to start playing the next song.
 * @apiparam (Response) Format A completed request will return a 204 NO CONTENT response code, and then issue the command to the player. Due to the asynchronous nature of the issuance of the command, you should use the Get Information About The User’s Current Playback endpoint to check that your issued command was handled correctly by the player. When performing an action that is restricted, 404 NOT FOUND or 403 FORBIDDEN will be returned together with a player error message. For example, if there are no active devices found, the request will return 404 NOT FOUND response code and the reason NO_ACTIVE_DEVICE, or, if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned together with the PREMIUM_REQUIRED reason.
 */
/**
 * @api {PUT} /player/repeat Set Repeat Mode On User’s Playback
 * @apiName Set Repeat Mode On User’s Playback
 * @apiGroup Player
 * @apiDescription
 * 
 * <p style="color:red;">Set the repeat mode for the user’s playback. Options are repeat-track, repeat-context, and off.</p>
 *
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 * 
 * @apiParam (Query Paramaters) state	     Required.track, context or off.track will repeat the current track.context will repeat the current context.off will turn repeat off.
 * @apiparam (Response) Format A completed request will return a 204 NO CONTENT response code, and then issue the command to the player. Due to the asynchronous nature of the issuance of the command, you should use the Get Information About The User’s Current Playback endpoint to check that your issued command was handled correctly by the player. When performing an action that is restricted, 404 NOT FOUND or 403 FORBIDDEN will be returned together with a player error message. For example, if there are no active devices found, the request will return 404 NOT FOUND response code and the reason NO_ACTIVE_DEVICE, or, if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned together with the PREMIUM_REQUIRED reason. 
 */
/**
 * @api {POST} /player/next Skip User’s Playback To Next Track
 * @apiName Skip User’s Playback To Next Track
 * @apiGroup Player
 * @apiDescription
 * 
 * <p style="color:red;">Skips to next track in the user’s queue.</p>
 *
 * After a successful skip operation, playback will automatically start.
 * 
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 * 
 * @apiparam (Response) Format A completed request will return a 204 NO CONTENT response code, and then issue the command to the player. Due to the asynchronous nature of the issuance of the command, you should use the Get Information About The User’s Current Playback endpoint to check that your issued command was handled correctly by the player. When performing an action that is restricted, 404 NOT FOUND or 403 FORBIDDEN will be returned together with a player error message. For example, if there are no active devices found, the request will return 404 NOT FOUND response code and the reason NO_ACTIVE_DEVICE, or, if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned together with the PREMIUM_REQUIRED reason.
 */
/**
 * @api {POST} /player/previous Skip User’s Playback To Previous Track
 * @apiName Skip User’s Playback To Previous Track
 * @apiGroup Player
 * @apiDescription
 * 
 * <p style="color:red;">Skips to previous track in the user’s queue.</p>
 *
 * Note that this will ALWAYS skip to the previous track, regardless of the current track’s progress. Returning to the start of the current track should be performed using the https://api.spotify.com/v1/me/player/seek endpoint.
 * 
 * After a successful skip operation, playback will automatically start.
 * 
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 * 
 * @apiparam (Response) Format A completed request will return a 204 NO CONTENT response code, and then issue the command to the player. Due to the asynchronous nature of the issuance of the command, you should use the Get Information About The User’s Current Playback endpoint to check that your issued command was handled correctly by the player. When performing an action that is restricted, 404 NOT FOUND or 403 FORBIDDEN will be returned together with a player error message. For example, if there are no active devices found, the request will return 404 NOT FOUND response code and the reason NO_ACTIVE_DEVICE, or, if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned together with the PREMIUM_REQUIRED reason.
 */
/**
 * @api {PUT} /player/play Start/Resume a User's Playback 
 * @apiName Start/Resume a User's Playback 
 * @apiGroup Player
 * @apiDescription
 * 
 * <p style="color:red;">Start a new context or resume current playback on the user’s active device.</p>
 *
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 * 
 * @apiParam (Body Parameters) {string}          context_uri      Optional. Spotify URI of the context to play. Valid contexts are albums, artists, playlists.
 * @apiParam (Body Parameters)  {Array_URIs}	 uris              Optional. A JSON array of the Spotify track URIs to play
 * @apiParam (Body Parameters)  {Object}         offset 	      Optional. Indicates from where in the context playback should start. Only available when context_uri corresponds to an album or playlist object, or when the uris parameter is used.“position” is zero based and can’t be negative
 * @apiParam (Body Parameters) {integer}        position_ms       Optional. Indicates from what position to start playback. Must be a positive number. Passing in a position that is greater than the length of the track will cause the player to start playing the next song.
 *
 * @apiparam (Response) Format A completed request will return a 204 NO CONTENT response code, and then issue the command to the player. Due to the asynchronous nature of the issuance of the command, you should use the Get Information About The User’s Current Playback endpoint to check that your issued command was handled correctly by the player. When performing an action that is restricted, 404 NOT FOUND or 403 FORBIDDEN will be returned together with a player error message. For example, if there are no active devices found, the request will return 404 NOT FOUND response code and the reason NO_ACTIVE_DEVICE, or, if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned together with the PREMIUM_REQUIRED reason.
 */
/**
 * @api {PUT}/player/shuffle Toggle Shuffle For User’s Playback
 * @apiName Toggle Shuffle For User’s Playback
 * @apiGroup Player
 * @apiDescription
 * 
 * <p style="color:red;">Toggle shuffle on or off for user’s playback.</p>
 *
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 * 
 * @apiParam (Query Paramaters)  state	Required   true : Shuffle user’s playback & false : Do not shuffle user’s playback.
 * @apiparam (Response) Format A completed request will return a 204 NO CONTENT response code, and then issue the command to the player. Due to the asynchronous nature of the issuance of the command, you should use the Get Information About The User’s Current Playback endpoint to check that your issued command was handled correctly by the player. When performing an action that is restricted, 404 NOT FOUND or 403 FORBIDDEN will be returned together with a player error message. For example, if there are no active devices found, the request will return 404 NOT FOUND response code and the reason NO_ACTIVE_DEVICE, or, if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned together with the PREMIUM_REQUIRED reason.
 */

/**
 * @api {POST} /player/add-to-queue Add an Item to the User's Playback Queue
 * @apiName Add an Item to the User's Playback Queue
 * @apiGroup Player
 * @apiDescription
 * 
 * <p style="color:red;">Add an item to the end of the user’s current playback queue.</p>
 *
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 * 
 * @apiParam (Query Paramaters) uri	Required. The uri of the item to add to the queue. Must be a track or an episode uri.
 * @apiparam (Response) format A completed request will return a 204 NO CONTENT response code, and then issue the command to the player. Due to the asynchronous nature of the issuance of the command, you should use the Get Information About The User’s Current Playback endpoint to check that your issued command was handled correctly by the player. When performing an action that is restricted, 404 NOT FOUND or 403 FORBIDDEN will be returned together with a player error message. For example, if there are no active devices found, the request will return 404 NOT FOUND response code and the reason NO_ACTIVE_DEVICE, or, if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned together with the PREMIUM_REQUIRED reason.
 */
//Playlist

/**
 * @api {POST} /playlists/{playlist_id}/tracks Add Tracks to a Playlist
 * @apiName Add Tracks to a Playlist
 * @apiGroup Playlist
 * @apiDescription
 * <p style="color:red;">Add one or more tracks to a user’s playlist..</p>
 *
 * The Spotify URIs of the tracks to add can be passed either in the query string or as a JSON array in the request body
 * 
 * . Passing them in the query string
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * @apiParam (Path Parameters)  playlist_id	The Spotify ID for the playlist
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * @apiHeader (Header)  Content-Type	Required if URIs are passed in the request body, otherwise ignored. The content type of the request body: application/json
 *
 *
 * @apiParam (Query Parameters)  {list_of_Spotify_URIs}  uris		Optional. A comma-separated list of Spotify track URIs to add.
 * A maximum of 100 tracks can be added in one request. Note: it is likely that passing a large number of track URIs as a query parameter will exceed the maximum length of the request URI. When adding a large number of tracks it is recommended to pass them in the request body
 * 
 * @apiParam (Query Parameters)  {integer} position		Optional. The position to insert the tracks, a zero-based index.
 *  For example, to insert the tracks in the first position: position=0; to insert the tracks in the third position: position=2 .
 *  If omitted, the tracks will be appended to the playlist. Tracks are added in the order they are listed in the query string or request body.
 *
 * @apiParam (Body Parameters)  {array_of_Spotify_URI_strings} uris		Optional. A JSON array of the Spotify track URIs to add.
 * A maximum of 100 tracks can be added in one request. Note: if the uris parameter is present in the query string, any URIs listed here in the body will be ignored.
 * @apiParam (Body Parameters)  {integer}  position		Optional. The position to insert the tracks, a zero-based index.
 *  
 * 
 * @apiparam (Response) Format On success, the HTTP status code in the response header is 201 Created. The response body contains a snapshot_id in JSON format. The snapshot_id can be used to identify your playlist version in future requests. On error, the header status code is an error code and the response body contains an error object. Trying to add a track when you do not have the user’s authorization, or when there are more than 10.000 tracks in the playlist, returns error 403 Forbidden.
 */
/**
 * @api {POST} /users/playlists Create a Playlist
 * @apiName Create a Playlist
 * @apiGroup Playlist
 * @apiDescription
 * 
 * <p style="color:red;">Create a playlist for a Spotify user. (The playlist will be empty until you add tracks.)</p>
 *
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * @apiHeader (Header)  Content-Type	Required. The content type of the request body: application/json
 * @apiParam (Body Parameters) {string}  name		Required. The new name for the playlist
 * @apiParam (Body Parameters) {Boolean} public		Optional. If true the playlist will be public, if false it will be private.
 * @apiParam (Body Parameters) {Boolean} collaborative		Optional. If true , the playlist will become collaborative and other users will be able to modify the playlist in their Spotify client. Note: You can only set collaborative to true on non-public playlists.
 * @apiParam (Body Parameters) {string}  description	Optional. Value for playlist description as displayed in Spotify Clients and in the Web API.
 * 
 * @apiparam (Response) Format On success, the response body contains the created playlist object in JSON format and the HTTP status code in the response header is 200 OK or 201 Created. There is also a Location response header giving the Web API endpoint for the new playlist. On error, the header status code is an error code and the response body contains an error object. Trying to create a playlist when you do not have the user’s authorization returns error 403 Forbidden.
 */
/**
 * @api {PUT} /playlists/{playlist_id} Change a Playlist's Details
 * @apiName Change a Playlist's Details
 * @apiGroup Playlist
 * @apiDescription
 * 
 * <p style="color:red;">Change a Playlist's Details Change a playlist’s name and public/private state. (The user must, of course, own the playlist.)</p>
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
 * @apiParam (Body Parameters) {string}  name		Optional. The new name for the playlist
 * @apiParam (Body Parameters) {Boolean} public		Optional. If true the playlist will be public, if false it will be private.
 * @apiParam (Body Parameters) {Boolean} collaborative		Optional. If true , the playlist will become collaborative and other users will be able to modify the playlist in their Spotify client. Note: You can only set collaborative to true on non-public playlists.
 * @apiParam (Body Parameters) {string}  description	Optional. Value for playlist description as displayed in Spotify Clients and in the Web API.
 * 
 *
 * @apiparam (Response) Format On success the HTTP status code in the response header is 200 OK. On error, the header status code is an error code and the response body contains an error object. Trying to change a playlist when you do not have the user’s authorization returns error 403 Forbidden.
 */

/**
 * @api {get} /playlists Get a List of Current User's Playlists
 * @apiName Get a List of Current User's Playlists.
 * @apiGroup Playlist
 * @apiDescription
 * 
 * <p style="color:red;">Get a list of the playlists owned or followed by the current Spotify user.</p>
 * 
 * 
 *Returns the most recent 50 tracks played by a user. Note that a track currently playing will not be visible in play history until it has completed. A track must be played for more than 30 seconds to be included in play history.
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 *
 *  @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 *  
 * 
 * @apiParam (Query Parameters)  limit  Optional. The maximum number of items to return. Default: 20. Minimum: 1. Maximum: 50.
 * @apiParam (Query Parameters)  offset	Optional. The index of the first playlist to return. Default: 0 (the first object). Maximum offset: 100.000. Use with limit to get the next set of playlists
 *
 * 
 *
 * @apiparam (Response) Format On success, the HTTP status code in the response header is 200 OK and the response body contains an array of simplified playlist objects (wrapped in a paging object) in JSON format. On error, the header status code is an error code and the response body contains an error object. Please note that the access token has to be tied to a user.
 */

/**
 * @api {GET}/users/{user_id}/playlists  Get a List of a User's Playlists
 * @apiName Get a List of a User's Playlists
 * @apiGroup Playlist
 * @apiDescription
 * 
 * <p style="color:red;">Get a list of the playlists owned or followed by a Spotify user.</br> 
 * 
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * @apiParam (path Parameters) user_id	The user’s Spotify user ID.
 *
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 *@apiParam (Query Parameters)  limit  Optional. The maximum number of items to return. Default: 20. Minimum: 1. Maximum: 50.
 * @apiParam (Query Parameters)  offset	Optional. The index of the first playlist to return. Default: 0 (the first object). Maximum offset: 100.000. Use with limit to get the next set of playlists
 *
 * @apiparam (Response) Format On success, the HTTP status code in the response header is 200 OK and the response body contains an array of simplified playlist objects (wrapped in a paging object) in JSON format. On error, the header status code is an error code and the response body contains an error object.
 */

/**
 * @api {GET}/playlists/{playlist_id} Get a Playlist
 * @apiName Get a Playlist.
 * @apiGroup Playlist
 * @apiDescription
 * 
 * <p style="color:red;">Get a playlist owned by a Spotify user.</p>
 *
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * @apiParam (Path Parameters)  playlist_id	The Spotify ID for the playlist
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 * 
 * @apiParam (Query Paramaters)  fields	Optional. Filters for the query: a comma-separated list of the fields to return. If omitted, all fields are returned. For example, to get just the playlist’s description and URI: fields=description,uri. A dot separator can be used to specify non-reoccurring fields, while parentheses can be used to specify reoccurring fields within objects
 * @apiParam (Query Paramaters)  market	Optional. An ISO 3166-1 alpha-2 country code or the string from_token. Provide this parameter if you want to apply Track Relinking.
 *
 * @apiparam (Response) Format On success, the response body contains a playlist object in JSON format and the HTTP status code in the response header is 200 OK. On error, the header status code is an error code and the response body contains an error object. Requesting playlists that you do not have the user’s authorization to access returns error 403 Forbidden. For the description in the Playlist object, it should be expected that HTML will be escaped.
 */
/**
 * @api {PUT}/playlists/{playlist_id}/tracks Get a Playlist's Tracks
 * @apiName Get a Playlist's Tracks
 * @apiGroup Playlist
 * @apiDescription
 * 
 * <p style="color:red;">Get full details of the tracks of a playlist owned by a Spotify user.</p>
 *
 * 
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1>
 * 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * 
 * 
 * @apiParam (Query Paramaters) fields	Optional. Filters for the query: a comma-separated list of the fields to return. If omitted, all fields are returned. For example, to get just the total number of tracks and the request limit:
 *fields=total,limit
 *A dot separator can be used to specify non-reoccurring fields, while parentheses can be used to specify reoccurring fields within objects. For example, to get just the added date and user ID of the adder:
 *fields=items(added_at,added_by.id)
 *Use multiple parentheses to drill down into nested objects, for example:
 *fields=items(track(name,href,album(name,href)))
 *Fields can be excluded by prefixing them with an exclamation mark, for example:
 *fields=items.track.album(!external_urls,images)
 * @apiParam (Query Paramaters)  limit	Optional. The maximum number of tracks to return. Default: 100. Minimum: 1. Maximum: 100.
 * @apiParam (Query Paramaters)  offset	Optional. The index of the first track to return. Default: 0 (the first object).
 * @apiParam (Query Paramaters)  market	Optional. An ISO 3166-1 alpha-2 country code or the string from_token. Provide this parameter if you want to apply Track Relinking.
 *
 * 
 * @apiparam (Response) Format On success, the response body contains an array of playlist track objects (wrapped in a paging object) in JSON format and the HTTP status code in the response header is 200 OK. On error, the header status code is an error code and the response body contains an error object. Requesting playlists that you do not have the user’s authorization to access returns error 403 Forbidden.
 */
/**
 * @api {GET} /Playlist/next Get a Playlist Cover Image
 * @apiName Get a Playlist Cover Image
 * @apiGroup Playlist
 * @apiDescription
 * 
 * <p style="color:red;">Get the current image associated with a specific playlist.</p>
 *
 * @apiParam (Path Parameters)  playlist_id	The Spotify ID for the playlist
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 * 
 * @apiparam (Response) Format On success, the response body contains a list of image objects in JSON format and the HTTP status code in the response header is 200 OK On error, the header status code is an error code and the response body contains an error object.
 */
/**
 * @api {POST}/playlists/{playlist_id}/tracks Remove Tracks from a Playlist
 * @apiName Remove Tracks from a Playlist
 * @apiGroup Playlist
 * @apiDescription
 * 
 * <p style="color:red;">Remove one or more tracks from a user’s playlist.</p>
 *There are several ways to specify which tracks to remove, determined by the request parameters.
 *<b>Removing all occurrences of specific tracks</b>
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
 * @apiParam ( remove all occurrences of a track or multiple tracks by specifying only the track URIs:)   tracks		Required. An array of objects containing Spotify URIs of the tracks to remove
 * @apiParam (  Removing a specific occurrence of a track)  tracks	Required. An array of objects containing Spotify URIs of the tracks to remove with their current positions in the playlist.
 * @apiParam ( Removing a specific occurrence of a track in a specific playlist snapshot)   tracks	Required. An array of objects containing Spotify URIs of the tracks to remove with their current positions in the playlist.The positions parameter is zero-indexed, that is the first track in the playlist has the value 0 , the second track 1 , and so on. A maximum of 100 objects can be sent at once.
 * @apiParam ( Removing a specific occurrence of a track in a specific playlist snapshot) snapshot_id	Optional.{string} The playlist’s snapshot ID against which you want to make the changes. The API will validate that the specified tracks exist and in the specified positions and make the changes, even if more recent changes have been made to the playlist.
 *
 * @apiParam ( Removing the track at a given position in a specific playlist snapshot) snapshot_id	Optional.{string} The playlist’s snapshot ID against which you want to make the changes. The API will validate that the specified tracks exist and in the specified positions and make the changes, even if more recent changes have been made to the playlist
 * @apiParam ( Removing the track at a given position in a specific playlist snapshot) tracks	Required. An array of objects containing Spotify URIs of the tracks to remove with their current positions in the playlist. uri": "spotify:track:1301WleyT98MSxVHPZCA6M", "positions": [7] }] } he positions parameter is zero-indexed, that is the first track in the playlist has the value 0, the second track 1, and so on. A maximum of 100 objects can be sent at once.
* 
* @apiparam (Response) Format On success, the response body contains a snapshot_id in JSON format and the HTTP status code in the response header is 200 OK. The snapshot_id can be used to identify your playlist version in future requests. On error, the header status code is an error code and the response body contains an error object. Trying to remove a track when you do not have the user’s authorization returns error 403 Forbidden. Attempting to use several different ways to remove tracks returns 400 Bad Request. Other client errors returning 400 Bad Request include specifying invalid positions
*/
/**
 * @api {PUT} /playlists/{playlist_id}/tracks Reorder a Playlist's Tracks
 * @apiName Reorder a Playlist's Tracks
 * @apiGroup Playlist
 * @apiDescription
 * 
 * <p style="color:red;">Reorder a track or a group of tracks in a playlist.</p>
 *
 * When reordering tracks, the timestamp indicating when they were added and the user who added them will be kept untouched. In addition, the users following the playlists won’t be notified about changes in the playlists when the tracks are reordered.
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
 * @apiParam (Body Parameters) {integer}       range_start		Required. The position of the first track to be reordered.
 * @apiParam (Body Parameters)  {integer}	 range_length		Optional. The amount of tracks to be reordered. Defaults to 1 if not set. The range of tracks to be reordered begins from the range_start position, and includes the range_length subsequent tracks.
 * @apiParam (Body Parameters)  {integer}     insert_before   	Required. The position where the tracks should be inserted.
 *To reorder the tracks to the end of the playlist, simply set insert_before to the position after the last track
 * @apiParam (Body Parameters) {string}        snapshot_id		Optional. The playlist’s snapshot ID against which you want to make the changes.
 *
 * 
* @apiparam (Response) Format On success, the response body contains a snapshot_id in JSON format and the HTTP status code in the response header is 200 OK. The snapshot_id can be used to identify your playlist version in future requests. On error, the header status code is an error code, the response body contains an error object, and the existing playlist is unmodified.
*/
/**
 * @api {PUT}/playlists/{playlist_id}/tracks Replace a Playlist's Tracks
 * @apiName Replace a Playlist's Tracks.
 * @apiGroup Playlist
 * @apiDescription
 * 
 * <p style="color:red;">Replace all the tracks in a playlist, overwriting its existing tracks. This powerful request can be useful for replacing tracks, re-ordering existing tracks, or clearing the playlist.</p>
 *
 * The Spotify URIs of the tracks to set can be passed either as a JSON array in the request body or as a list in the query string. The request can only accept a maximum of 100 tracks; any additional tracks will need to be added using the “Add Tracks to a Playlist” endpoint.
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
 * @apiParam (Query Paramaters) {list_of_Spotify_URIs} uris		Optional. A comma-separated list of Spotify track URIs to set.
 *
 * 
 * @apiParam (body Paramaters)  {list_of_Spotify_URIs_strings} uris	Optional. A JSON array of the Spotify track URIs to set. For example: {"uris": ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh", "spotify:track:1301WleyT98MSxVHPZCA6M"]}Currently, a maximum of 100 tracks can be set. Note: if the uris parameter is present in the query string, any URIs listed here in the body will be ignored.
 * 
 * @apiparam (Response) Format on success, the HTTP status code in the response header is 201 Created. On error, the header status code is an error code, the response body contains an error object, and the existing playlist is unmodified. Trying to set a track when you do not have the user’s authorization returns error 403 Forbidden.
 */
/**
 * @api {PUT} /playlists/{playlist_id}/images Upload a Custom Playlist Cover Image
 * @apiName Upload a Custom Playlist Cover Image.
 * @apiGroup Playlist
 * @apiDescription
 * 
 * <p style="color:red;">Replace the image used to represent a specific playlist.</p>
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
 * @apiParam (body Paramaters)  image Base64 encoded JPEG image data, maximum payload size is 256 KB
 * @apiparam (Rate limiting) Ratelimiting If you get status code 429, it means that you have sent too many requests. If this happens, have a look in the Retry-After header, where you will see a number displayed. This is the amount of seconds that you need to wait, before you can retry sending your requests.
 * @apiparam (Response) Format A successful request will return a 202 ACCEPTED response code. When the image has been provided, we forward it on to our transcoder service in order to generate the three sizes provided in the playlist’s images object. This operation may take a short time, so performing a GET request to the playlist may not immediately return URLs to the updated images.On error, the header status code is an error code and the response body contains an error object.
 */
//search
/**
 * @api {get} /search Search for an Item
 * @apiName Search for an Item
 * @apiGroup Search
 * @apiDescription
 * <p style="color:red;">Get Spotify Catalog information about artists, albums, tracks or playlists that match a keyword string.</p>
 *
 * <h1> Request parameters</h1> 
 * </br></br><h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service
 *
 * @apiparam (Query parameters) q	Required.Search query keywords and optional field filters and operators.
 * @apiparam (Query parameters) type	Required.A comma-separated list of item types to search across.Valid types are: album , artist, playlist, and track.Search results include hits from all the specified item types.
 * @apiparam (Query parameters) market	Optional.
 *</br>An ISO 3166-1 alpha-2 country code or the string from_token.
 *</br>If a country code is specified, only artists, albums, and tracks with content that is playable in that market is returned.
 *</br>Note:
 *</br>- Playlist results are not affected by the market parameter.
 *</br>- If market is set to from_token, and a valid access token is specified in the request header, only content playable in the country associated with the user account, is returned.
 *</br>- Users can view the country that is associated with their account in the account settings. A user must grant access to the user-read-private scope prior to when the access token is issued.
 * @apiparam (Query parameters) limit	Optional.
 *</br>Maximum number of results to return.
 *</br>Default: 20
 *</br>Minimum: 1
 *</br>Maximum: 50
 *</br>Note: The limit is applied within each type, not on the total response.
 *</br>For example, if the limit value is 3 and the type is artist,album, the response contains 3 artists and 3 albums.
 * @apiparam (Query parameters) offset	Optional.
 *</br>The index of the first result to return.
 *</br>Default: 0 (the first result).
 *</br>Maximum offset (including limit): 2,000.
 *</br>Use with limit to get the next page of search results. 
 * @apiparam (Query parameters) include_external	Optional.
 *</br>Possible values: audio
 *</br>If include_external=audio is specified the response will include any relevant audio content that is hosted externally.
 *</br>By default external content is filtered out from responses.
 */
/**
 * @api /search Writing a Query - Guidelines
 * @apiName Writing a Query - Guidelines
 * @apiGroup Search
 * @apiDescription
 *Encode spaces with the hex code %20 or +.
 *  </br></br> Keyword matching: Matching of search keywords is not case-sensitive. Operators, however, should be specified in uppercase. Unless surrounded by double quotation marks, keywords are matched in any order. For example: q=roadhouse&20blues matches both “Blues Roadhouse” and “Roadhouse of the Blues”. q="roadhouse&20blues" matches “My Roadhouse Blues” but not “Roadhouse of the Blues”.
 *  </br> </br>Searching for playlists returns results where the query keyword(s) match any part of the playlist’s name or description. Only popular public playlists are returned.
 *  </br></br> Operator: The operator NOT can be used to exclude results.
 *  </br></br> Similarly, the OR operator can be used to broaden the search: q=roadhouse%20OR%20blues returns all the results that include either of the terms. Only one OR operator can be used in a query.
 *  </br> </br>Note: Operators must be specified in uppercase. Otherwise, they are handled as normal keywords to be matched.
 *  </br></br> Field filters: By default, results are returned when a match is found in any field of the target object type. Searches can be made more specific by specifying an album, artist or track field filter.
 * </br></br>To limit the results to a particular year, use the field filter year with album, artist, and track searches.
 *  </br></br> Or with a date range. 
 *  </br></br> To retrieve only albums released in the last two weeks, use the field filter tag:new in album searches.
 * </br></br>  To retrieve only albums with the lowest 10% popularity, use the field filter tag:hipster in album searches. Note: This field filter only works with album searches.
 * </br></br> Depending on object types being searched for, other field filters, include genre (applicable to tracks and artists), upc, and isrc. For example: q=lil%20genre:%22southern%20hip%20hop%22&type=artist. Use double quotation marks around the genre keyword string if it contains spaces.
 * 
 * </br><h1> Response Format</h1> 
 *  </br></br>On success: 
 * </br></br>In the response header the HTTP status code is 200 OK.
 * </br></br>The response body contains an array of artist objects, simplified album objects, and/or track objects wrapped in a paging object in JSON.
 * </br> </br>On error: 
 * </br></br>The header status code is an error code.
 * </br></br>The response body contains an error object.
 */



//Tracks

/**
 * @api {get} /audio-analysis/{id} Get Audio Analysis for a Track
 * @apiName Get Audio Analysis for a Track
 * @apiGroup Tracks
 * @apiDescription
 * <p style="color:red;">Get a detailed audio analysis for a single track identified by its unique Spotify ID.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization 			Required. A valid access token from the Spotify Accounts service.
 * 
 * 
 * @apiParam (PathParameters)  id				Required. The Spotify ID for the track.
 * 
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains an audio analysis object in JSON format.</br> On error, the header status code is an error code and the response body contains an error object.
 */


/**
 * @api {get} track/audio-features/{id}  Get Audio Features for a Track
 * @apiName Get Audio Features for a Track
 * @apiGroup Tracks
 * @apiDescription
 * <p style="color:red;">Get audio feature information for a single track identified by its unique Spotify ID.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 *
 * 
 * @apiHeader (Header)  Authorization 	Required. A valid access token from the Spotify Accounts service.

 * 
 *  @apiParam (PathParameters)  id 					Required. The Spotify ID for the track.
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains an audio features object in JSON format. </br>On error, the header status code is an error code and the response body contains an error object.
 */

/**
 * @api {get} tracks/audio-features Get Audio Features for Several Tracks
 * @apiName Get Audio Features for Several Tracks
 * @apiGroup Tracks
 * @apiDescription
 * <p style="color:red;">Get audio features for multiple tracks based on their Spotify IDs.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization 		Required. A valid access token from the Spotify Accounts service.
 * 
 *  @apiParam (QueryParameters)  ids  				Required. A comma-separated list of the Spotify IDs for the tracks. Maximum: 100 IDs.
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains</br> an object whose key is "audio_features" and whose value is an array of audio features objects in JSON format.</br></br> Objects are returned in the order requested. If an object is not found, a null value is returned in the appropriate position.</br> Duplicate ids in the query will result in duplicate objects in the response. </br>On error, the header status code is an error code and the response body contains an error object.
 */

/**
 * @api {get} /tracks Get Several Tracks
 * @apiName Get Several Tracks
 * @apiGroup Tracks
 * @apiDescription
 * <p style="color:red;">Get Spotify catalog information for multiple tracks based on their Spotify IDs.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization 			Required. A valid access token from the Spotify Accounts service. 
 * 
 * 
 *  @apiParam (QueryParameters)  ids  				Required. A comma-separated list of the Spotify IDs for the tracks. Maximum: 50 IDs.
 * @apiParam (QueryParameters)   market   		Optional. An ISO 3166-1 alpha-2 country code or the string from_token.</br> Provide this parameter if you want to apply Track Relinking.
 *
 *  @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains an object whose key is tracks and whose value is an array of track objects in JSON format.</br> Objects are returned in the order requested. If an object is not found, a null value is returned in the appropriate position.</br> Duplicate ids in the query will result in duplicate objects in the response. </br>On error, the header status code is an error code and the response body contains an error object.
 */



/**
 * @api {get} /track/{id} Get a Track
 * @apiName Get a Track
 * @apiGroup Tracks
 * @apiDescription
 * <p style="color:red;">Get Spotify catalog information for a single track identified by its unique Spotify ID.</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization Required. A valid access token from the Spotify Accounts service.
 * 
 *  @apiParam (QueryParameters)  id 						The Spotify ID for the track.
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains a track object in JSON format. </br>On error, the header status code is an error code and the response body contains an error object.
 */

//Users Profile

/**
 * @api {get} /me Get Current User's Profile
 * @apiName Get Current User's Profile
 * @apiGroup Users Profile
 * @apiDescription
 * <p style="color:red;">Get detailed profile information about the current user (including the current user’s username).</p>
 *
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization 			Required. A valid access token from the Spotify Accounts service.</br> The access token must have been issued on behalf of the current user.</br>Reading the user’s email address requires the user-read-email scope; </br>reading country and product subscription level requires the user-read-private scope.
 * 
 *
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains a user object in JSON format.</br> On error, the header status code is an error code and the response body contains an error object.</br> When requesting fields that you don’t have the user’s authorization to access, it will return error 403 Forbidden.</br></br></br> <b>Important!</b> If the user-read-email scope is authorized, </br>the returned JSON will include the email address that was entered when the user created their Spotify account.</br> This email address is unverified; do not assume that the email address belongs to the user.
 */

/**
 * @api {get} /users/{user_id} Get a User's Profile
 * @apiName Get a User's Profile
 * @apiGroup Users Profile
 * @apiDescription
 * <p style="color:red;">Get public profile information about a Spotify user.</p>
 * 
 * 
 * <h1>Request Parameters</h1></br></br>
 * 
 * <h1> Endpoint</h1> 
 * 
 * @apiHeader (Header)  Authorization 		Required. A valid access token from the Spotify Accounts service.
 * 
 * @apiParam (PathParameters)  User_id 				The user’s Spotify user ID.
 * 
 * @apiParam (Removing Specific Occurance of a Track in a Specific Playlist Snapshot)  REQUEST_DATA 
 * 
 * @apiParam (Response)  Format  On success, the HTTP status code in the response header is 200 OK and the response body contains a user object in JSON format.</br> On error, the header status code is an error code and the response body contains an error object.</br> If a user with that user_id doesn’t exist, the status code is 404 NOT FOUND.
 */