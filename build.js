const Fs = require('fs');
require('total.js');

deleteFolder('__flow');
Fs.mkdirSync(F.path.root('__flow'));

U.ls('./', function callback(files,dirs) {

	dirs.wait(function(dir, next){

		if (dir.startsWith('.') || dir.startsWith('node_modules') || dir.startsWith('__flow'))
			return next();

		var source = U.join(F.path.root(dir), dir + '.js');
		var target = U.join(F.path.root('__flow'), dir + '.js');

		F.path.exists(source, function callback(exists) {
			exists && Fs.createReadStream(source).pipe(Fs.createWriteStream(target));
			next();
		});
	}, function(){
		console.log('\nAll components have been copied to __flow directory. Copy them to `<your-app>/flow` directory.\n');
	});
});

function deleteFolder(path) {
	var files = [];
	if(Fs.existsSync(path)) {
		files = Fs.readdirSync(path);
		files.forEach(function(file){
			var curPath = path + '/' + file;
			if (Fs.lstatSync(curPath).isDirectory())
				deleteFolder(curPath);
			else
				Fs.unlinkSync(curPath);
		});
		Fs.rmdirSync(path);
	}
}