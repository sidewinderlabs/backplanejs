/*********
 * 
 * Quick program to replace a string in all xhtml files in a directory and any subdirectories.
 * 2009/05/19 - creation
 * 2009/05/29 - added default XML namespace fixing components
 * Takes 4 command line arguments in this order:
 *
 * args[0] - operation to perform. ("xmlns" or "replace");
 * args[1] - directory to begin searching in.
 * args[2] - the needle to replace.
 * args[3] - the replacement string.
 * args[4] - a string to prefix the replacement string with for each subdirectory (Ex. use "../" if making relative URIs).
 * 
 **********/
import java.io.*;
import java.util.regex.*;

public class RecursiveStringReplacer {
	private static String needle;				// = "http://ubiquity-xforms.googlecode.com/trunk/ubiquity-loader.js";
	private static String newString;			// = "../../../src/ubiquity-loader.js";
	private static String prefixPerDirectory;	// = "../";
	private static String mode;
	
	public static String readFileContents(File file) {
		String fileContents = "";
		try {
			FileReader fileStream = new FileReader(file);
			int temp;
			try {
				while ((temp = fileStream.read()) != -1) fileContents += (char)temp;
				fileStream.close();
				return fileContents;
			} catch (IOException e) {
			}
		} catch (FileNotFoundException e) {
		}
		return null;
	}
	
	public static void writeFileContents(File file, String contents) {
		System.out.println("Fixed: " + file);
		try {
			FileWriter fileStream = new FileWriter(file);
			fileStream.write(contents);
			fileStream.close();
		} catch (Exception e) {	
		}
	}
	
	private static void findFiles(File currDir, String replaceString) {
		File[] dirContents = currDir.listFiles();
		for (File file : dirContents) {
			if (file.isDirectory()) findFiles(file, prefixPerDirectory + replaceString);
			else {
				if (file.toString().substring(file.toString().lastIndexOf('.')).equals(".xhtml")) {
					String fileContents = readFileContents(file);
					//System.out.println(fileContents);
					String newFileContents = "";
					if (mode.equals("Standard Replace"))
						newFileContents = fileContents.replaceAll(needle, replaceString);
					else if (mode.equals("Default XMLNamespace"))
						newFileContents = addDefaultXMLNamespace(fileContents);
					
					if (!newFileContents.equals(fileContents)) writeFileContents(file, newFileContents);
				}
			}
		}
	}
	
	public static String addDefaultXMLNamespace(String haystack) {
		Pattern pattern = Pattern.compile("(<xf(orms)?:instance)(.*>)");
		Matcher matcher = pattern.matcher(haystack);
		int start = 0;
		while (matcher.find(start)) {
			start = matcher.end();
			if (!matcher.group().contains("xmlns"))
				haystack = haystack.replaceAll(matcher.group(), matcher.group(1) + " xmlns=\"\"" + matcher.group(3));
		}
		return haystack;
	}
	
	public static void main(String[] args) {
		if (args[0].equals("xmlns")) {
			mode = "Default XMLNamespace";
			findFiles(new File(args[1]), "");
		} else {		
			needle = args[2];
			newString = args[3];
			prefixPerDirectory = (args.length > 4) ? args[4] : "";
			mode = "Standard Replace";
			findFiles(new File(args[1]), newString);
		}
	}

}
