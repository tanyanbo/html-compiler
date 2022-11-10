const html = `
<div>
  <p>
    testing
    <p>aaa</p>
    <button id='test-button' disabled>testing</button>
  </p>
  <p style="background-color: red">            cessssshi</p>
</div>
<header class='heading' id='main-title'>this is the title</header>
`
// const html = "<p>testing</p>"

enum State {
  START,
  OPEN_TAG,
  CLOSE_TAG,
  TEXT,
  PROPS,
}

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
])

export class MyNode {
  tagName: string
  children: (MyNode | string)[]
  props: Record<string, string>

  constructor(
    tagName: string,
    children: (MyNode | string)[] = [],
    props: Record<string, string> = {}
  ) {
    this.tagName = tagName
    this.children = children
    this.props = props
  }

  print(indent = 0) {
    console.log(`${" ".repeat(indent)}${this.tagName}`)
    this.children.forEach((child) => {
      if (typeof child === "string") {
        console.log(`${" ".repeat(indent + 2)}${child}`)
      } else {
        child.print(indent + 2)
      }
    })
  }
}

export function compileHtml(html: string) {
  let currentState: State = State.START
  let stack: MyNode[] = []
  let res: MyNode[] = []
  let curText: string = ""
  let curProps: Record<string, string> = {}

  function parseComment(startIdx: number): {
    isComment: boolean
    endIdx: number | null
  } {
    let slice = html.slice(startIdx)

    if (slice.startsWith("<!--")) {
      const endIdx = slice.indexOf("-->") + startIdx

      if (endIdx >= 0) {
        stack[stack.length - 1].children.push(
          new MyNode("comment", [html.slice(startIdx + 4, endIdx)])
        )
        return {
          isComment: true,
          endIdx: endIdx + 2,
        }
      }
    }

    return {
      isComment: false,
      endIdx: null,
    }
  }

  for (let i = 0, len = html.length; i < len; i++) {
    switch (currentState) {
      case State.START:
        if (html[i] === "<") {
          const isCommentRes = parseComment(i)
          if (isCommentRes.isComment) {
            i = isCommentRes.endIdx!
            continue
          }
          currentState = State.OPEN_TAG
        } else if (/[\n ]/.test(html[i])) {
          continue
        } else {
          currentState = State.TEXT
          curText += html[i]
        }
        break
      case State.OPEN_TAG:
        if (html[i] === ">") {
          if (VOID_TAGS.has(curText.trim())) {
            currentState = State.START
            const node = new MyNode(curText.trim())
            curText = ""
            if (stack.length) {
              // current node is not a root element
              stack[stack.length - 1].children.push(node)
            } else {
              // current node is a root element
              res.push(node)
            }
          } else {
            currentState = State.START
            const node = new MyNode(curText.trim())
            if (stack.length === 0) {
              res.push(node)
            }
            stack.push(node)
          }
          curText = ""
        } else if (html[i] === "/") {
          if (html[i - 1] === "<") {
            currentState = State.CLOSE_TAG
          } else {
            // self-closing tag
            currentState = State.START
            const node = new MyNode(curText)
            curText = ""
            if (stack.length === 0) {
              res.push(node)
            } else {
              stack[stack.length - 1].children.push(node)
            }
            i++
          }
        } else if (html[i] === " ") {
          currentState = State.PROPS
          const node = new MyNode(curText, [], curProps)
          if (stack.length === 0) {
            res.push(node)
          }
          stack.push(node)
          curText = ""
        } else {
          curText += html[i]
        }
        break
      case State.TEXT:
        if (html[i] === "<") {
          const isCommentRes = parseComment(i)
          if (isCommentRes.isComment) {
            i = isCommentRes.endIdx!
            stack[stack.length - 1].children.splice(
              stack.length - 1,
              0,
              curText.trim()
            )
            curText = ""
            continue
          }
          currentState = State.OPEN_TAG
          curText.trim() &&
            stack[stack.length - 1].children.push(curText.trim())
          curText = ""
        } else {
          curText += html[i]
        }
        break
      case State.PROPS:
        if (html[i] === "=") {
          const quote = html[i + 1]
          for (let idx = i + 2; idx < len; idx++) {
            if (html[idx] === quote && html[idx - 1] !== "\\") {
              curProps[curText.trim()] = html.slice(i + 2, idx)
              i = idx
              curText = ""
              break
            }
          }
        } else if (html[i] === " ") {
          if (curText.trim()) {
            curProps[curText.trim()] = "true"
            curText = ""
          }
        } else if (html[i] === "/" && html[i + 1] === ">") {
          if (curText.trim() === "") {
            currentState = State.START
            curText = ""
            if (stack.length > 1) {
              stack[stack.length - 2].children.push(stack[stack.length - 1])
            }
            stack.pop()
            i++
          }
        } else if (html[i] === ">") {
          if (VOID_TAGS.has(stack[stack.length - 1].tagName)) {
            currentState = State.START
            curText = ""
            curProps = {}
            if (stack.length > 1) {
              stack[stack.length - 2].children.push(stack[stack.length - 1])
            }
            stack.pop()
            continue
          }
          if (curText !== "" && curText !== "/") {
            curProps[curText] = "true"
            curText = ""
          }
          currentState = State.START
          curProps = {}
        } else {
          curText += html[i]
        }
        break
      case State.CLOSE_TAG:
        if (html[i] === ">") {
          if (VOID_TAGS.has(curText.trim())) {
            currentState = State.START
            curText = ""
            continue
          }
          if (curText.trim() !== stack[stack.length - 1].tagName) {
            throw new Error("Closing tag does not match opening tag")
          }
          currentState = State.START
          curText = ""
          const popped = stack.pop()
          if (stack.length) {
            stack[stack.length - 1].children.push(popped!)
          }
        } else {
          curText += html[i]
        }
    }
  }

  return res
}

const { performance } = require("perf_hooks")
const startTime = performance.now()
compileHtml(
  `
<head>
  <title>Keith Galli's Page</title>
  <style>
  table {
    border-collapse: collapse;
  }
  th {
    padding:5px;
  }
  td {
    border: 1px solid #ddd;
    padding: 5px;
  }
  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
  th {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    background-color: #add8e6;
    color: black;
  }
  .block {
  width: 100px;
  /*float: left;*/
    display: inline-block;
    zoom: 1;
  }
  .column {
  float: left;
  height: 200px;
  /*width: 33.33%;*/
  padding: 5px;
  }

  .row::after {
    content: "";
    clear: both;
    display: table;
  }
</style>
</head>
<body>
  <h1>Welcome to my page!</h1>
  <img src="./images/selfie1.jpg" width="300px">
  <h2>About me</h2>
  <p>Hi, my name is Keith and I am a YouTuber who focuses on content related to programming, data science, and machine learning!</p>
  <p>Here is a link to my channel: <a href="https://www.youtube.com/kgmit">youtube.com/kgmit</a></p>
  <p>I grew up in the great state of New Hampshire here in the USA. From an early age I always loved math. Around my senior year of high school, my brother first introduced me to programming. I found it a creative way to apply the same type of logical thinking skills that I enjoyed with math. This influenced me to study computer science in college and ultimately create a YouTube channel to share some things that I have learned along the way.</p>
  <h3>Hobbies</h3>
  <p>Believe it or not, I don't code 24/7. I love doing all sorts of active things. I like to play ice hockey & table tennis as well as run, hike, skateboard, and snowboard. In addition to sports, I am a board game enthusiast. The two that I've been playing the most recently are <i>Settlers of Catan</i> and <i>Othello</i>.</p>
  <h3>Fun Facts</h3>
  <ul class="fun-facts">
    <li>Owned my dream car in high school <a href="#footer"><sup>1</sup></a></li>
    <li>Middle name is Ronald</li>
    <li>Never had been on a plane until college</li>
    <li>Dunkin Donuts coffee is better than Starbucks</li>
    <li>A favorite book series of mine is <i>Ender's Game</i></li>
    <li>Current video game of choice is <i>Rocket League</i></li>
    <li>The band that I've seen the most times live is the <i>Zac Brown Band</i></li>
  </ul>
  <h2>Social Media</h2>
  I encourage you to check out my content on all social media platforms
  <br/>
  <ul class="socials">
    <li class="social instagram"><b>Instagram: </b><a href="https://www.instagram.com/keithgalli/">https://www.instagram.com/keithgalli/</a></li>
    <li class="social twitter"><b>Twitter: </b><a href="https://twitter.com/keithgalli">https://twitter.com/keithgalli</a></li>
    <li class="social linkedin"><b>LinkedIn: </b><a href="https://www.linkedin.com/in/keithgalli/">https://www.linkedin.com/in/keithgalli/</a></li>
    <li class="social tiktok"><b>TikTok: </b><a href="https://www.tiktok.com/@keithgalli">https://www.tiktok.com/@keithgalli</a></li>
  </ul>
  <h2>Photos</h2>
  Here are a few photos from a trip to italy I took last year
  <div class="row">
    <div class="column">
      <img src="images/italy/lake_como.jpg" alt="Lake Como" style="height:100%">
    </div>
    <div class="column">
      <img src="images/italy/pontevecchio.jpg" alt="Pontevecchio, Florence" style="height:100%">
    </div>
    <div class="column">
      <img src="images/italy/riomaggiore.jpg" alt="Riomaggiore, Cinque de Terre" style="height:100%">
    </div>
  </div>
  <div></div>
  <h2> Table </h2>
  My MIT hockey stats :) 
  <br></br>
  <table class="hockey-stats">
      <thead>
          <tr>
              <th class="season" data-sort="">S</th>
              <th class="team" data-sort="team">Team</th>
              <th class="league" data-sort="league">League</th>
              <th class="regular gp" data-sort="gp">GP</th>
              <th class="regular g" data-sort="g">G</th>
              <th class="regular a" data-sort="a">A</th>
              <th class="regular tp" data-sort="tp">TP</th>
              <th class="regular pim" data-sort="pim">PIM</th>
              <th class="regular pm" data-sort="pm">+/-</th>
              <th class="separator">&nbsp;</th>
              <th class="postseason">POST</th>
              <th class="postseason gp" data-sort="playoffs-gp">GP</th>
              <th class="postseason g" data-sort="playoffs-g">G</th>
              <th class="postseason a" data-sort="playoffs-a">A</th>
              <th class="postseason tp" data-sort="playoffs-tp">TP</th>
              <th class="postseason pim" data-sort="playoffs-pim">PIM</th>
              <th class="postseason pm" data-sort="playoffs-pm">+/-</th>
          </tr>
      </thead>
      <tbody>
          <tr class="team-continent-NA ">
              <td class="season sorted">
                  2014-15
              </td>
              <td class="team">
                  <i><img src="images/flag.png"></i>
                  <span class="txt-blue">
                      <a href="https://www.eliteprospects.com/team/10263/mit-mass.-inst.-of-tech./2014-2015?tab=stats"> MIT (Mass. Inst. of Tech.) </a>
                  </span>
              </td>
              <td class="league"> <a href="https://www.eliteprospects.com/league/acha-ii/stats/2014-2015"> ACHA II </a> </td>
              <td class="regular gp">17</td>
              <td class="regular g">3</td>
              <td class="regular a">9</td>
              <td class="regular tp">12</td>
              <td class="regular pim">20</td>
              <td class="regular pm"></td>
              <td class="separator"> | </td>
              <td class="postseason">
                  <a href="https://www.eliteprospects.com/league/acha-ii/stats/2014-2015"> </a>
              </td>
              <td class="postseason gp">
              </td>
              <td class="postseason g">
              </td>
              <td class="postseason a">
              </td>
              <td class="postseason tp">
              </td>
              <td class="postseason pim">
              </td>
              <td class="postseason pm">
              </td>
          </tr>
          <tr class="team-continent-NA ">
              <td class="season sorted">
                  2015-16
              </td>
              <td class="team">
                  <i><img src="images/flag.png"></i>
                  <span class="txt-blue">
                      <a href="https://www.eliteprospects.com/team/10263/mit-mass.-inst.-of-tech./2015-2016?tab=stats"> MIT (Mass. Inst. of Tech.) </a>
                  </span>
              </td>
              <td class="league"> <a href="https://www.eliteprospects.com/league/acha-ii/stats/2015-2016"> ACHA II </a> </td>
              <td class="regular gp">9</td>
              <td class="regular g">1</td>
              <td class="regular a">1</td>
              <td class="regular tp">2</td>
              <td class="regular pim">2</td>
              <td class="regular pm"></td>
              <td class="separator"> | </td>
              <td class="postseason">
                  <a href="https://www.eliteprospects.com/league/acha-ii/stats/2015-2016"> </a>
              </td>
              <td class="postseason gp">
              </td>
              <td class="postseason g">
              </td>
              <td class="postseason a">
              </td>
              <td class="postseason tp">
              </td>
              <td class="postseason pim">
              </td>
              <td class="postseason pm">
              </td>
          </tr>
          <tr class="team-continent-NA ">
              <td class="season sorted">
                  2016-17
              </td>
              <td class="team">
                  <i><img src="images/flag.png"></i>
                  <span class="txt-blue">
                      <a href="https://www.eliteprospects.com/team/10263/mit-mass.-inst.-of-tech./2016-2017?tab=stats"> MIT (Mass. Inst. of Tech.) </a>
                  </span>
              </td>
              <td class="league"> <a href="https://www.eliteprospects.com/league/acha-ii/stats/2016-2017"> ACHA II </a> </td>
              <td class="regular gp">12</td>
              <td class="regular g">5</td>
              <td class="regular a">5</td>
              <td class="regular tp">10</td>
              <td class="regular pim">8</td>
              <td class="regular pm">0</td>
              <td class="separator"> | </td>
              <td class="postseason">
              </td>
              <td class="postseason gp">
              </td>
              <td class="postseason g">
              </td>
              <td class="postseason a">
              </td>
              <td class="postseason tp">
              </td>
              <td class="postseason pim">
              </td>
              <td class="postseason pm">
              </td>
          </tr>
          <tr class="team-continent-EU ">
              <td class="season sorted">
                  2017-18
              </td>
              <td class="team">
                  Did not play
              </td>
              <td class="league"> <a href="https://www.eliteprospects.com/stats"> </a> </td>
              <td class="regular gp"></td>
              <td class="regular g"></td>
              <td class="regular a"></td>
              <td class="regular tp"></td>
              <td class="regular pim"></td>
              <td class="regular pm"></td>
              <td class="separator"> | </td>
              <td class="postseason">
                  <a href="https://www.eliteprospects.com/stats"> </a>
              </td>
              <td class="postseason gp">
              </td>
              <td class="postseason g">
              </td>
              <td class="postseason a">
              </td>
              <td class="postseason tp">
              </td>
              <td class="postseason pim">
              </td>
              <td class="postseason pm">
              </td>
          </tr>
          <tr class="team-continent-NA ">
              <td class="season sorted">
                  2018-19
              </td>
              <td class="team">
                  <i><img src="images/flag.png"></i>
                  <span class="txt-blue">
                      <a href="https://www.eliteprospects.com/team/10263/mit-mass.-inst.-of-tech./2018-2019?tab=stats"> MIT (Mass. Inst. of Tech.) </a>
                  </span>
              </td>
              <td class="league"> <a href="https://www.eliteprospects.com/league/acha-iii/stats/2018-2019"> ACHA III </a> </td>
              <td class="regular gp">8</td>
              <td class="regular g">5</td>
              <td class="regular a">10</td>
              <td class="regular tp">15</td>
              <td class="regular pim">8</td>
              <td class="regular pm"></td>
              <td class="separator"> | </td>
              <td class="postseason">
                  <a href="https://www.eliteprospects.com/league/acha-iii/stats/2018-2019"> </a>
              </td>
              <td class="postseason gp">
              </td>
              <td class="postseason g">
              </td>
              <td class="postseason a">
              </td>
              <td class="postseason tp">
              </td>
              <td class="postseason pim">
              </td>
              <td class="postseason pm">
              </td>
          </tr>
      </tbody>
  </table>
  <h2>Mystery Message Challenge!</h2>
  <p>If you scrape the links below grabbing the &lt;p&gt; tag with id="secret-word", you'll discover a secret message :)</p>
  <div width="50%">
  <div class="block" align="left">
    <ul>
      <li><a href="challenge/file_1.html">File 1</a></li>
      <li><a href="challenge/file_2.html">File 2</a></li>
      <li><a href="challenge/file_3.html">File 3</a></li>
      <li><a href="challenge/file_4.html">File 4</a></li>
      <li><a href="challenge/file_5.html">File 5</a></li>
    </ul>
  </div>
  <div class="block" align="center">
    <ul>
      <li><a href="challenge/file_6.html">File 6</a></li>
      <li><a href="challenge/file_7.html">File 7</a></li>
      <li><a href="challenge/file_8.html">File 8</a></li>
      <li><a href="challenge/file_9.html">File 9</a></li>
      <li><a href="challenge/file_10.html">File 10</a></li>
    </ul>
  </div>
  </div>
  <h2>Footnotes</h2>
  <p id="footer">1. This was actually a minivan that I named Debora. Maybe not my dream car, but I loved her nonetheless.</p>
  </body>
`
)

const endTime = performance.now()

console.log(endTime - startTime)
