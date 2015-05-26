var redmineIssueTimer = (function ($, undefined) {
    "use strict";

    var cssPrefix = 'redmine_issue_timer_';
    var roundInputValueTo = 3;
    var elapsedSeconds = 0;
    var input;
    var playButton;
    var pauseButton;
    var clockLabel;
    var timerId;
    var url = window.location.host + window.location.pathname;
    var issueUrlId = url.replace(/(\/|\.|\W)/g, ''); //redmineruissues223
    var commitButton;


    var init = function () {
        input = $('#time_entry_hours');
        if (input.length === 0) {
            return;
        }

        commitButton = $('input[name="commit"]');

        createContainer(); //конструктор html'а

        loadValueFromStorage(); //загрузка стораджа для текущего урла задачи

        loadValueFromInput();

        setClockValue();

        inputOnchangeAutoSave();

        commitButtonHandler(); //события клика сабмита и проверка на прошлое нажатие

        input.attr('autocomplete', 'off');

    };


    var createContainer = function() {
        clockLabel = $('<span id="' + cssPrefix + 'clock">00:00:00</span>');
        playButton = $('<a href="javascript:void(0);" id="' + cssPrefix + 'play_button" class="' + cssPrefix + 'btn play">Play</a>');
        pauseButton = $('<a href="javascript:void(0);" id="' + cssPrefix + 'pause_button" class="' + cssPrefix + 'btn pause">Pause</a>');

        var timerContainer = $('<div id="' + cssPrefix + 'container"/>');
        timerContainer.append(clockLabel);
        timerContainer.append(playButton);
        timerContainer.append(pauseButton);

        input.parent().append(timerContainer);

        bindEvents();
    };

    var bindEvents = function() {
        playButton.click(onPlayButtonClick);
        pauseButton.click(onPauseButtonClick);
    };

    var onPlayButtonClick = function () {
        if (timerId) {
            return;
        }
        startTimer();
    };

    var onPauseButtonClick = function () {
        stopTimer();
    };

    var loadValueFromStorage = function () {
    	if (localStorage[issueUrlId+'_sec'] || localStorage[issueUrlId+'_stamp']) {
    		input.val(toHr(getTimer()));
    	}
        if (localStorage[issueUrlId+'_onPlay'])
            startTimer();
    };

    var loadValueFromInput = function () {
        var inputValue = input.val();
        if (!$.isNumeric(inputValue)) {
            return;
        }
        var newValue = parseInt(parseFloat(inputValue) * 3600, 10);
        if (elapsedSeconds === newValue) {
            return;
        }
        elapsedSeconds = newValue;
    };

    var setClockValue = function () {
        var formattedValue = secondsToFormattedClockValue(elapsedSeconds);
        clockLabel.html(formattedValue);
    };

    var secondsToFormattedClockValue = function (seconds) {
        var t = parseInt(seconds, 10);

        var h = Math.floor(t / 3600);
        var m = Math.floor((t - (h * 3600)) / 60);
        var ss = t - (h * 3600) - (m * 60);

        var formattedValue = leftPadding(h.toString(), '0', 2) + ":" + leftPadding(m.toString(), '0', 2) + ":" + leftPadding(ss.toString(), '0', 2);
        return formattedValue;
    };

    var hoursToSeconds = function (hours) {
        var h = hours;
        return Math.floor(h * 3600);
    };

    var leftPadding = function (str, padString, length) {
        while (str.length < length) {
            str = padString + str;
        }
        return str;
    };

    var startTimer = function () {
        timerId = setInterval(refreshElapsedTimeValue, 1000);
        localStorage[issueUrlId+'_sec'] = getTimer();
        localStorage[issueUrlId+'_stamp'] = getCurTime();
        localStorage[issueUrlId+'_onPlay'] = true;
    };

    var stopTimer = function() {
        clearInterval(timerId);
        timerId = null;
        localStorage[issueUrlId+'_sec'] = getTimer();
        localStorage[issueUrlId+'_onPlay'] = '';
    };

    var getCurTime = function() {
        var time = new Date().getTime();
        return Math.floor(time / 1000);
    };

    var toHr = function(elapsedSeconds) {
        var numericValue = secondsToHours(elapsedSeconds);
        return numericValue.toFixed(roundInputValueTo);
    };

    var getTimer = function() {
        if (localStorage[issueUrlId+'_onPlay']) {
            if (localStorage[issueUrlId + '_sec']==0){
                return getCurTime() - localStorage[issueUrlId + '_stamp'];
            } else {
                return getCurTime() - localStorage[issueUrlId + '_stamp'] + parseInt(localStorage[issueUrlId + '_sec']);
            }
        } else {
            if (localStorage[issueUrlId + '_sec']==0){
                return 0;
            } else {
                return localStorage[issueUrlId + '_sec'];
            }
        }

    };

    var refreshElapsedTimeValue = function () {
        if (!timerId) {
            return;
        }
        elapsedSeconds += 1;
        setInputValue();
        setClockValue();
    };

    var setInputValue = function () {
        //decimal
        var numericValue = secondsToHours(elapsedSeconds);
        var newVal = numericValue.toFixed(roundInputValueTo);
        input.val(newVal);
    };

    var secondsToHours = function (t) {
        return (t / 3600);
    };

    var inputOnchangeAutoSave = function () {
    	input.on('input', function(){
	    	localStorage[issueUrlId+'_sec'] = hoursToSeconds(input.val().replace(',', '.'));
            localStorage[issueUrlId+'_stamp'] = getCurTime();
	    	loadValueFromInput();
	    	setClockValue();
	    });
    };

    var commitButtonHandler = function () {
        //when commit time value we want to reset time value in input, otherwise
        //we need to manual erase this value
        commitButton.click(function () {
            localStorage[issueUrlId + 'onSave'] = localStorage[issueUrlId+'_sec'];
            //after form submit we must check if value stored in input equal this
            //value we must reset
        });

        if (localStorage[issueUrlId+'_sec'] == localStorage[issueUrlId + 'onSave']) {
            input.val('');
            elapsedSeconds = 0;
            setClockValue();
            localStorage[issueUrlId+'_sec'] = localStorage[issueUrlId + 'onSave'] = 0;
        }
    };
    

    init();
}(jQuery));
