import fs from 'fs';

// Function to read map data from file
export function readMapFromFile(filename, callback) {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log('Instances file not found. Creating new file.');
        return callback(null, new Map()); // Return a new Map if file doesn't exist
      } else {
        console.error('Error reading instances file:', err);
        return callback(err, null);
      }
    }
    try {
      // If file exists but is empty, return an empty Map
      if (!data) {
        return callback(null, new Map());
      }

      const parsedData = JSON.parse(data);
      // Convert object to a Map
      const objectToMap = new Map();
      for (let key in parsedData) {
        objectToMap.set(key, parsedData[key]);
      }
      callback(null, objectToMap);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      callback(error, null);
    }
  });
}

// Function to write map data to file
export function writeMapToFile(map, filename) {
  // Convert map to a regular object (key-value pairs)
  const mapToObject = {};
  for (let [key, value] of map) {
    mapToObject[key] = value;
  }

  // Convert object to JSON
  const jsonData = JSON.stringify(mapToObject, null, 2);

  // Write data to a file
  fs.writeFile(filename, jsonData, (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    // console.log('Map data has been written to', filename);
  });
}