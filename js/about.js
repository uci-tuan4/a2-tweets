function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	

	const counts = {completed_event: 0, live_event: 0, achievement: 0, miscellaneous: 0};
	let writtenCompleted = 0;
	let firstDate = null;
	let lastDate = null;
	for (const tweet of tweet_array) {
		counts[tweet.source]++;
		if (tweet.source == 'completed_event' && tweet.written) {
			writtenCompleted++;
		}
		if (firstDate === null || tweet.time < firstDate) firstDate = tweet.time;
		if (lastDate === null || tweet.time > lastDate) lastDate = tweet.time;
	}

	const dateOptions = {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'};
	document.getElementById('firstDate').innerText = firstDate ? firstDate.toLocaleDateString('en-US', dateOptions) : 'N/A';
	document.getElementById('lastDate').innerText = lastDate ? lastDate.toLocaleDateString('en-US', dateOptions) : 'N/A';

	const categories = {
		completedEvents: 'completed_event', liveEvents: 'live_event',
		achievements: 'achievement', miscellaneous: 'miscellaneous'
	};
	for (const className of Object.keys(categories)) {
		const count = counts[categories[className]];
		for (const span of document.querySelectorAll('.' + className)) {
			span.innerText = count;
		}
		const percentage = tweet_array.length ? count / tweet_array.length * 100 : 0;
		document.querySelector('.' + className + 'Pct').innerText = percentage.toFixed(2) + '%';
	}
	document.querySelector('.written').innerText = writtenCompleted;
	const writtenPercentage = counts.completed_event ? writtenCompleted / counts.completed_event * 100 : 0;
	document.querySelector('.writtenPct').innerText = writtenPercentage.toFixed(2) + '%';
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});
