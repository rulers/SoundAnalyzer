/*
 * @param:
 */
function analyzeAudio(buffer, callback) {
    var data = buffer.getChannelData(0);

    var max_value = null;
    var min_value = null;

    for (var i = 0; i < data.length; i++) {
        if (max_value < data[i]) {
            max_value = data[i];
        }

        if (min_value > data[i]) {
            min_value = data[i];
        }
    }

    var range = max_value - min_value;

	// console.log(range);

    var analyzeResult = [0];
    var preData = null;

    for (var i = 1; i < data.length-1; i++) {
		// console.log(data[i] > data[i-1]);
        //no evidence for root 3
        if(data[i] > max_value*(1/(Math.pow(3,0.5))) && (data[i] > data[i-1]) && ( data[i] > data[i+1]) ){
            analyzeResult.push(1);
        }else{
            analyzeResult.push(0);
        }
    };
    //tail embed
    analyzeResult.push(0);
    callback(analyzeResult);
	console.log(data);
    return data;
}