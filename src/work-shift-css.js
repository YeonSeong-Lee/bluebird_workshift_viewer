const css = `
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 18px;
        text-align: left;
    }

    #header {
        background-color: #73a7d9;
        color: #ffffff;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
    }

    #shift-form {
        display: flex;
        justify-content: space-between;
    }

    table thead tr {
        background-color: #73a7d9;
        color: #ffffff;
        text-align: left;
        font-weight: bold;
    }

    table th, table td {
        padding: 12px 15px;
        border: 1px solid #dddddd;
        min-width: 42px;
    }

    table tbody tr {
        border-bottom: 1px solid #dddddd;
    }

    table tbody tr:nth-of-type(even) {
        background-color: #f3f3f3;
    }

    table tbody tr:last-of-type {
        border-bottom: 2px solid #73a7d9;
    }

    table tbody tr:hover {
        background-color: #f1f1f1;
    }
`

export default css;