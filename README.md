# Distributed Data Aggregation System - Frontend App

The system is available through an interactive application with a user interface. Queries are submitted via a form where the user selects a table from those available in the system. The form dynamically updates to allow the selection of grouping and aggregated columns based on the selected table. Only columns of supported types are shown. For aggregated columns, the user must choose an aggregation function: minimum (`Min`), maximum (`Max`), average (`Avg`), sum (`Sum`), or count (`Count`). 

The query can be extended with additional grouping columns (via the `+ ADD GROUP COLUMN` button) and aggregated columns (via the `+ ADD SELECT COLUMN` button). Columns can also be removed using the `REMOVE` button. 

The query is submitted using the `SUBMIT` button, triggering form validation. The following conditions are checked:
- A table is selected.
- At least one grouping column is selected.
- At least one aggregated column is selected.
- Grouping columns do not repeat.
- No column is selected as both grouping and aggregated.

If validation fails, the user is notified and can correct the form. Once the form is successfully validated, it is sent as a query to the system. During query processing, a loading icon appears in the results section. If successful, a table is displayed in the results section, with grouping columns followed by aggregated columns (including their aggregation functions). The table is populated with the query results. To accommodate large tables, the form can be hidden using a button in the top-left corner, and a "back to top" button is available in the bottom-right corner.

If the system encounters an error during query processing, the user is notified via a message in the results section.

Additionally, the user can upload files to the system. Clicking the `UPLOAD` button opens a dialog where the user enters the table name. If the name matches an existing table, the file is appended; otherwise, a new table is created. The user selects a `.parquet` file using the `Choose File` button and must provide both a table name and file for the form to be valid. The `CANCEL` button closes the dialog without uploading. Upon clicking `UPLOAD`, the system attempts to process the file. If the schema of the file does not match the target table, an error message is displayed. Otherwise, a success message confirms the upload.

<p align="center">
  <img src="https://github.com/user-attachments/assets/83203bed-563e-49e8-9d6e-d4a00aa69188" alt="Sample screen"/>
</p>

## Prerequisites

Make sure you have `npm` (to run the app) and Docker (to create Docker image) installed.

### 

## Available Scripts

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the project directory, you can run:

### `npm install --legacy-peer-deps`

Installs all required dependencies.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3006](http://localhost:3006) to view it in your browser.

The page will reload when you make changes.\

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Docker image

In the project directory, you can run:

### `docker build -t front-image .`

to create Docker image.


