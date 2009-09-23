var schemeHandlers = [ ];

schemeHandlers["file"] = [ ];

schemeHandlers["file"]["PUT"] = function (fileName, data, timeout, callback) {
	var fileWriter,
	    isSuccess;

	try {
		fileWriter = document.fileIOFactory.createFileWriter(fileName);
		fileWriter.write(data);
		fileWriter.close();
		isSuccess = true;
	} catch(e) {
		isSuccess = false;
	}

	// If there is a callback object then give it the results.
	//
	if (callback) {
		callback.processResult(
			{
				method: "PUT",
				status : 200,             
				statusText : "",
				responseText : data,
				responseHeaders : "",
				resourceURI : fileName
			},
			!isSuccess
		);
	}
	return isSuccess;
};

schemeHandlers["file"]["GET"] = function (fileName, data, timeout, callback) {
	var fileReader,
	    data,
	    isSuccess;

	try {
		fileReader = document.fileIOFactory.createFileReader(fileName);
		data = fileReader.read(null, null, -1);
		fileReader.close();
		isSuccess = true;
	} catch(e) {
		isSuccess = false;
	}

	// If there is a callback object then give it the results.
	//
	if (callback) {
		callback.processResult(
			{
				method: "GET",
				status : 200,             
				statusText : "",
				responseText : data,
				responseHeaders : "",
				resourceURI : fileName
			},
			!isSuccess
		);
	}
	return isSuccess;
};

schemeHandlers["file"]["DELETE"] = function (fileName, data, timeout, callback) {
	var file,
	    isSuccess;

	try {
		file = document.fileIOFactory.createFile(fileName);
		isSuccess = file["delete"]();
	} catch(e) {
		isSuccess = false;
	}

	// If there is a callback object then give it the results.
	//
	if (callback) {
		callback.processResult(
			{
				method: "DELETE",
				status : 200,
				statusText : "",
				responseText : data,
				responseHeaders : "",
				resourceURI : fileName
			},
			!isSuccess
		);
	}
	return isSuccess;
};
