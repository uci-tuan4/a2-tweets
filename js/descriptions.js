let writtenTweets = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	writtenTweets = runkeeper_tweets.map(function(tweet, index) {
		return {tweet: new Tweet(tweet.text, tweet.created_at), number: index + 1};
	}).filter(entry => entry.tweet.written);
	updateSearch();
}

function addEventHandlerForSearch() {
	document.getElementById('textFilter').addEventListener('input', updateSearch);
	updateSearch();
}

function updateSearch() {
	const text = document.getElementById('textFilter').value;
	const query = text.trim().toLowerCase();
	const matches = query ? writtenTweets.filter(entry => entry.tweet.writtenText.toLowerCase().includes(query)) : [];
	document.getElementById('searchText').textContent = text;
	document.getElementById('searchCount').textContent = matches.length;
	document.getElementById('tweetTable').innerHTML = matches.map(function(entry) {
		return entry.tweet.getHTMLTableRow(entry.number);
	}).join('');
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});
