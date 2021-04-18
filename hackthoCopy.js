const puppeteer = require("puppeteer");
let fs = require("fs");
const xl = require('excel4node');
const wb = new xl.Workbook();
const ws = wb.addWorksheet('Worksheet Name');
let links = ["https://www.naukri.com", "https://www.hirist.com/", "https://www.timesjobs.com/"];

let jobTitle = process.argv[2];

(async function () {
    try {
        let browserInstance = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized"]
        });
        //let jobDetails=[];
       // let naukriJobs = await getJobsFromNaukri(browserInstance, links[0], jobTitle);

        console.log(naukriJobs.length);
        // let hiristJobs = await getJobsFromhirist(browserInstance,links[1],jobTitle);
        let FreshWorksJobs=await getJobsFromFreshersWorld(browserInstance,links[2],jobTitle);

        // let allJobs=[];


        //  for(let i=0;i<naukriJobs.length;i++){
        //      allJobs.push(naukriJobs[i]);
        //  }

        //  for(let i=0;i<hiristJobs.length;i++){
        //     allJobs.push(hiristJobs[i]);
        // }

        // for(let i=0;i<FreshWorksJobs.length;i++){
        //     allJobs.push(FreshWorksJobs[i]);
        // }

        // makeXlsx(allJobs);

    } catch (err) {
        console.log(err);
    }
})();

function makeXlsx(allJobs) {
    const headingColumnNames = [
        "name",
        "company",
        "exp",
        "salary",
        "location",
        "link",
    ]
    let headingColumnIndex = 1;
    headingColumnNames.forEach(heading => {
        ws.cell(1, headingColumnIndex++)
            .string(heading)
    });

    let rowIndex = 2;
    allJobs.forEach(record => {
        let columnIndex = 1;
        Object.keys(record).forEach(columnName => {
            ws.cell(rowIndex, columnIndex++)
                .string(record[columnName])
        });
        rowIndex++;
    });
    wb.write('JobsList.xlsx');

}
//"#qsb-keyword-sugg"

async function getJobsFromNaukri(browserInstance, webPageLink, jobTitle) {
    try {
        let Page = await browserInstance.newPage();
        await Page.setDefaultNavigationTimeout(0);
        await Page.goto(webPageLink);
        await Page.type("#qsb-keyword-sugg", jobTitle);
        await Page.click(".search-btn");

        await Page.waitForSelector(".fleft.pages a", { visible: true });
        let PageLinksArr = await Page.evaluate(consoleFnforGetJobPagesArr, ".fleft.pages a");

        await Page.waitForSelector("a.title.fw500.ellipsis", { visible: true });
        await Page.waitForSelector("a.subTitle.ellipsis.fleft", { visible: true });
        await Page.waitForSelector("span.ellipsis.fleft.fs12.lh16", { visible: true });

        let firstPageJobs=await Page.evaluate(consoleFn,"a.title.fw500.ellipsis","a.subTitle.ellipsis.fleft","span.ellipsis.fleft.fs12.lh16");
        let RemJobs = await getJobsinRemainingPagesFromNaukri(Page, PageLinksArr);
        for(let i=0;i<firstPageJobs.length;i++){
            RemJobs.push(firstPageJobs[i]);
        }
         
        return RemJobs;

    }
    catch (err) {
        console.log(err);
    }

}

async function getJobsinRemainingPagesFromNaukri(Page, JobPagesArray) {
    try {
        let RemjobsFromNaukri=[];
        for (let i = 1; i < JobPagesArray.length; i++) {
            await Page.goto(JobPagesArray[i]);
            await Page.waitForSelector("a.title.fw500.ellipsis", { visible: true });
            await Page.waitForSelector("a.subTitle.ellipsis.fleft", { visible: true });
            await Page.waitForSelector("span.ellipsis.fleft.fs12.lh16", { visible: true });
            let arr = await Page.evaluate(consoleFn, "a.title.fw500.ellipsis", "a.subTitle.ellipsis.fleft", "span.ellipsis.fleft.fs12.lh16");
            for (let i = 0; i < arr.length; i++) {
                RemjobsFromNaukri.push(arr[i]);
            }
        }
        // console.log(arr);
        // console.log(RemjobsFromNaukri);
        return RemjobsFromNaukri;
        //return RemjobsFromNaukri;

    }
    catch (err) {
        console.log(err);
    }


}

function consoleFn(LinkAndName, CompanyName, LocSalExp) {

    let ln = document.querySelectorAll(LinkAndName);
    let cn = document.querySelectorAll(CompanyName);
    let lse = document.querySelectorAll(LocSalExp);

    let count = 0;
    let jobDetails = [];

    for (let i = 0; i < ln.length; i++) {
        let link = ln[i].href;
        let name = ln[i].innerText;

        let company = cn[i].innterText;

        let exp = lse[count].innerText;
        count++;
        let salary = lse[count].innerText;
        count++;

        let location = lse[count].innerText;
        count++;

        jobDetails.push({ name, company, exp, salary, location, link });
    }
    return jobDetails;
}


function consoleFnforGetJobPagesArr(getPageArr) {
    let arr = document.querySelectorAll(getPageArr);
    let pageLinks = [];
    for (let i = 0; i < arr.length; i++) {
        pageLinks.push(arr[i].href);
    }
    // console.log(arr);
    return pageLinks;
}

//.job-title a ->name of role ,link
//.dark_grey.align-title -> name of the company
//.dark_grey.col-year ->experience
//.show-tooltip.dark_grey ->location

async function getJobsFromhirist(browserInstance, webPageLink, jobTitle) {
    let Page = await browserInstance.newPage();
    await Page.setDefaultNavigationTimeout(0);
    await Page.goto(webPageLink);

    await Page.type("input[placeholder='Search Jobs']", jobTitle);
    await Page.keyboard.press('Enter');

    // sc-bwCtUz dKeRyd
    // sc-eTuwsz bJZKKT

    await Page.waitForSelector(".job-title a", { visible: true });
    await Page.waitForSelector(".dark_grey.align-title", { visible: true });
    await Page.waitForSelector(".dark_grey.col-year", { visible: true });
    await Page.waitForSelector(".show-tooltip.dark_grey", { visible: true });
    // await Page.waitForSelector("span.ellipsis.fleft.fs12.lh16", { visible: true });

    function consoleFn(LinkAndName, company, exp, loc) {
        let jobDetails = [];
        //let jobContainer;
        //window.onload = function() {
        let ln = document.querySelectorAll(LinkAndName);
        let com = document.querySelectorAll(company);
        let ex = document.querySelectorAll(exp);
        let lo = document.querySelectorAll(loc);


        //  };
        // console.log(jobContainer)
        // let count=0;
        for (let i = 0; i < ln.length; i++) {
            let link = ln[i].href;
            let name = ln[i].innerText;

            let company = com[i].innerText;

            let exp = ex[i].innerText;
            // count++;
            let salary = "Not define";
            let location = lo[i].innerText;

            jobDetails.push({ name, company, exp, salary, location, link });
        }
        return jobDetails;
    }
    return Page.evaluate(consoleFn, ".job-title a", ".dark_grey.align-title", ".dark_grey.col-year", ".show-tooltip.dark_grey");


}

//.clearfix.job-bx.wht-shd-bx h2 a -> get name and link
//.joblist-comp-name ->get company name
//.top-jd-dtl.clearfix li ->get experience


async function getJobsFromFreshersWorld(browserInstance, webPageLink, jobTitle) {
    let Page = await browserInstance.newPage();
    await Page.setDefaultNavigationTimeout(0);
    await Page.goto(webPageLink);

    await Page.type("input[id='txtKeywords']", jobTitle);
    await Page.keyboard.press('Enter');
    await Page.waitForSelector(".clearfix.job-bx.wht-shd-bx h2", { visible: true });
    await Page.waitForSelector(".joblist-comp-name", { visible: true });
    await Page.waitForSelector(".top-jd-dtl.clearfix li", { visible: true });
    //await Page.waitForSelector(".search-button-submit.search_btn_form.button_orange_sumbit", { visible: true });

    function consoleFn(LinkAndName, CompanyName, Exp) {
        let jobDetails = [];
        let ln = document.querySelectorAll(LinkAndName);
        let cn = document.querySelectorAll(CompanyName);
        // let exp=document.querySelectorAll(Exp);        
        for (let i = 0; i < ln.length; i++) {
            let link = ln[i].href;
            let name = ln[i].innerText;

            let company = cn[i].innterText;

            let exp = "Any Experience";

            let salary = "Not Mentioned";

            let location = "Not Mentioned";

            jobDetails.push({ name, company, exp, salary, location, link });
        }
        return jobDetails;
    }
    return Page.evaluate(consoleFn, ".clearfix.job-bx.wht-shd-bx h2 a", ".joblist-comp-name", ".top-jd-dtl.clearfix li");
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

