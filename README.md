# MGU Result Scraper
This is a  simple project to get the result screenshots of a list of students from [Mahatma Gandhi University](https://www.mgu.ac.in/) result portal.

### 🌟 Introduction
First of all, [Mahatma Gandhi University](https://www.mgu.ac.in/) doen't have a fixed official URL for accessing all results. They keep on changing as the results get published. Two prominant links *(active as of now)* for accessing results are listed down below:
> The accuracy of these links are questionable as time passes. But the element heirarchy within result pages remains the same always.
- [UG Exam Results](https://dsdc.mgu.ac.in/exQpMgmt/index.php/public/ResultView_ctrl/)
- [PG Exam Results](https://pareeksha.mgu.ac.in/Pareeksha/index.php/Public/PareekshaResultView_ctrl/index/3)

### 🌟 Script in Action (Demo)

![Demo](https://user-images.githubusercontent.com/44474792/174436549-32713b4f-8140-4266-b3e5-6bde4ee1e982.gif)

### 🌟 Installation
1. Clone this repository
```sh
git clone https://github.com/decoded-cipher/mgu-result-bot.git
```

2. Install NPM packages
```sh
npm install
```

3. Update the `data.json` file.
> Update the file with **Permenent Registration Numbers (PRN)** and the **Exam ID**. Exam ID (`option` value) can be obtained by inspecting the **Examination** `<select>` tag on result portal.
```json
{
    "exam_id" : "58",
    "prn" : [
        "203242210987",
        " ... ",
        "203242211046"
    ]
}
```
### 🌟 Run Project
This project can be made run by executing the following command via terminal.
```sh
npm start
```