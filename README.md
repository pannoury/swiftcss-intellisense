# SwiftCSS
SwiftCSS is a CSS utility package that simplifies and streamlines the styling of your web projects using predefined classes. Similar to Tailwind CSS, it offers a wide range of predefined classes that allow you to style your web elements effortlessly. Additionally, SwiftCSS supports dynamic classes and pseudo-classes, making it a powerful tool for creating modern web interfaces.

Dynamic Attributes
SwiftCSS provides dynamic classes that can be customized using square brackets, allowing you to apply dynamic values to your styles. Some of the available dynamic attributes include:

color-[#xxx]: Customize colors dynamically.
bg-[#xxx]: Set dynamic background colors.
text-[#xxx]: Adjust text colors dynamically.
And more!
Input File Integration
Unlike many other CSS frameworks, SwiftCSS offers a straightforward solution for incorporating input files. Input files are appended on top of the output file generated by the CLI, making it easy to manage and include custom styles and configurations.

## Commands
SwiftCSS offers three essential commands to streamline your development workflow:

### 1. init
The init command generates a swiftcss.config.js file, allowing you to configure and specify various aspects of your project, including:

Input and output files.
Media queries and their ranges.
Directories to scan for style changes.
File extensions to include.

```
npx swiftcss init
```

### 2. watch
The watch command monitors files across all specified directories and automatically updates the output file when changes occur. This ensures that your styles are always up to date during development.
```
npx swiftcss watch
```

### 3. build
The build command generates a compressed output using the PostCSS compiler, reducing the size of the output CSS file for production use.
```
npx swiftcss build
```

## CSS Optimization
SwiftCSS takes care of optimizing your CSS by ensuring that only classes that have been used are included in the output. It also removes duplicates, ensuring that the final stylesheet consists of unique classes only.

## Dark and Light Mode Support
SwiftCSS offers built-in support for attributes like style-light and style-dark, allowing you to specify classes and styles for dark and light mode, making it easy to create responsive and visually appealing designs.

## Media Query Support
With SwiftCSS, defining responsive styles is a breeze. Simply specify your desired screen sizes and their respective ranges in the configuration file, and SwiftCSS will automatically generate classes that apply only when the screen size falls within the specified limits.

## Configuration Example
Here's an example of the configuration file (swiftcss.config.js):
```
module.exports = {
    fileExtensions: ["html", "js", "jsx", "ts", "tsx"],
    directories: ["./src"],
    input: "", // Specify an input file to be appended into the output file
    output: "./output.css",
    screens: {
        sd: { max: 600 },
        md: { min: 600, max: 1200 },
        ld: { min: 1200 },
    },
};
```

With the example config displayed above, the compiler will accept the following labels: style-sd, style-md & style-ld. Would you add for instance xl:

```
module.exports = {
    fileExtensions: ["html", "js", "jsx", "ts", "tsx"],
    directories: ["./src"],
    input: "", // Specify an input file to be appended into the output file
    output: "./output.css",
    screens: {
        sd: { max: 600 },
        md: { min: 600, max: 1200 },
        ld: { min: 1200, max: 1800 },
        xl: { min: 1800 }
    },
};
```

Then style-xl will be accepted.

This configuration allows you to customize SwiftCSS to suit your project's specific needs by specifying input files, output file paths, supported screen sizes, and more.

Get started with SwiftCSS and simplify your web styling today! For detailed usage instructions, please refer to the official documentation.