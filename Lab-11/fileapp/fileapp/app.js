// Import File System module
const fs = require('fs');

// 1. Create a file
fs.writeFile('demo.txt', 'Hello, this is first file.\n', (err) => {
    if (err) throw err;
    console.log('File created successfully.');

    // 2. Read file
    fs.readFile('demo.txt', 'utf8', (err, data) => {
        if (err) throw err;
        console.log('File content:', data);

        // 3. Append data
        fs.appendFile('demo.txt', 'This is appended text.\n', (err) => {
            if (err) throw err;
            console.log('Data appended successfully.');

            // 4. Read again
            fs.readFile('demo.txt', 'utf8', (err, data) => {
                if (err) throw err;
                console.log('Updated content:', data);

                // 5. Delete file
                fs.unlink('demo.txt', (err) => {
                    if (err) throw err;
                    console.log('File deleted successfully.');
                });
            });
        });
    });
});