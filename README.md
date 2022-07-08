**读书后台管理信息系统**

# 1. 版本控制

## 1.1 迭代过程

0.1

实现登录

设置主页

搭建目录结构基本框架

0.2

实现文件上传

连通数据库

图书列表显示

基本字段的增删查改

0.3

实现文件解析

后端补齐20个页面（包括图表、图标、友链、换肤、反馈、指南等边缘功能）

0.4

实现嵌套目录解析

实现多语言解析

实现大文件解析

## 1.2 文件目录

前端文件目录（仅展开到三级目录并只显示文件夹）：

├─plop-templates

│ ├─component

│ └─view

├─public

├─src

│ ├─api

│ ├─assets

│ │ ├─401\_images

│ │ ├─404\_images

│ │ └─custom-theme

│ │ └─fonts

│ ├─components

│ │ ├─BackToTop

│ │ ├─Breadcrumb

│ │ ├─Charts

│ │ ├─DndList

│ │ ├─DragSelect

│ │ ├─Dropzone

│ │ ├─EbookUpload

│ │ ├─ErrorLog

│ │ ├─GithubCorner

│ │ ├─Hamburger

│ │ ├─HeaderSearch

│ │ ├─ImageCropper

│ │ ├─JsonEditor

│ │ ├─Kanban

│ │ ├─MarkdownEditor

│ │ ├─MDinput

│ │ ├─Pagination

│ │ ├─PanThumb

│ │ ├─RightPanel

│ │ ├─Screenfull

│ │ ├─Share

│ │ ├─SizeSelect

│ │ ├─Sticky

│ │ ├─SvgIcon

│ │ ├─TextHoverEffect

│ │ ├─ThemePicker

│ │ ├─Tinymce

│ │ ├─Upload

│ │ └─UploadExcel

│ ├─directive

│ │ ├─clipboard

│ │ ├─el-drag-dialog

│ │ ├─el-table

│ │ ├─permission

│ │ └─waves

│ ├─filters

│ ├─icons

│ │ └─svg

│ ├─layout

│ │ ├─components

│ │ └─mixin

│ ├─router

│ │ └─modules

│ ├─store

│ │ └─modules

│ ├─styles

│ ├─utils

│ ├─vendor

│ └─views

└─tests

└─unit

├─components

└─utils

后端文件目录：

D:.

│ .gitignore

│ app.js

│ package-lock.json

│ package.json

│

├─.idea

│ admin-imooc-node.iml

│ cd

│ misc.xml

│ modules.xml

│ tree

│ workspace.xml

│

├─db

│ config.js

│ index.js

│

├─https

│ 6607692\_simony.xyz.key

│ 6607692\_simony.xyz.pem

│

├─models

│ Book.js

│ Result.js

│

├─node\_modules

│

├─router

│ book.js

│ index.js

│ jwt.js

│ user.js

│

├─services

│ book.js

│ user.js

│

└─utils

constant.js

env.js

epub.js

index.js

# 2. 技术实现

## 2.1 概述

![](RackMultipart20220708-1-mylsl2_html_1252c5bf91d6e91b.png)

项目中的技术难点如下：登录模块的用户名密码校验、token 生成、校验和路由过滤、前端 token 校验和重定向，电子书上传模块的文件上传和静态资源服务器配置，电子书解析模块的epub 原理、zip 解压、xml 解析，电子书增删改模块的mysql 数据库应用、前后端异常处理。

## 2.2 用户登录

后端API处理流程如下。

![](RackMultipart20220708-1-mylsl2_html_b6a20a69f950dd72.png)

响应过程封装完毕后，我们需要在数据库中查询用户信息来验证用户名和密码是否准确。这里需要基于 mysql 查询库封装一层 service，用来协调业务逻辑和数据库查询，我们不希望直接把业务逻辑写在 router 中，创建 /service/user.js

## 2.3 电子书上传

电子书上传过程分为新增电子书和编辑电子书。

上传组件开发基于 el-upload 封装了上传组件 EbookUpload，上传图书表单中包括以下信息：

- 书名
- 作者
- 出版社
- 语言
- 根文件
- 文件路径
- 解压路径
- 封面路径
- 文件名称
- 封面
- 目录

上传API开发通过指定目的 nginx 上传路径实现。一旦电子书拷贝到指定目录下后，就可以通过 nginx 生成下载链接。

![](RackMultipart20220708-1-mylsl2_html_fdc05bed05dcc333.png)

上传通过node的multer组件实现，包括基本的异常处理。

![](RackMultipart20220708-1-mylsl2_html_8d0bd84ea56c82cf.png)

前端逻辑为上传成功时，会将解析的电子书内容填入表单；删除电子书时，会将电子书表单内容复原；而因为需要将表单复原，所以需要表单的默认值。电子书编辑提交表单时需要提供创建书籍和更新书籍两个接口。

## 2.4 电子书解析

电子书核心解析的核心在于对Book对象的创建和后续处理。

构建Book 对象分为两种场景，第一种是直接从电子书文件中解析出 Book 对象，第二种是从 data 对象中生成 Book 对象。

![](RackMultipart20220708-1-mylsl2_html_5ff254f8d7f27ad4.png)

逻辑分别为从文件读取电子书后，初始化 Book 对象。

| createBookFromFile(file) {    const {      destination,      filename,      mimetype = MIME\_TYPE\_EPUB,      path,      originalname    } = file    // 电子书的文件后缀名    const suffix = mimetype === MIME\_TYPE\_EPUB ? &#39;.epub&#39; : &#39;&#39;    // 电子书的原有路径    const oldBookPath = path    // 电子书的新路径    const bookPath = `${destination}/${filename}${suffix}`    // 电子书的下载URL    const url = `${UPLOAD\_URL}/book/${filename}${suffix}`    // 电子书解压后的文件夹路径    const unzipPath = `${UPLOAD\_PATH}/unzip/${filename}`    // 电子书解压后的文件夹URL    const unzipUrl = `${UPLOAD\_URL}/unzip/${filename}`    if (!fs.existsSync(unzipPath)) {      fs.mkdirSync(unzipPath, { recursive: true })    }    if (fs.existsSync(oldBookPath) &amp;&amp; !fs.existsSync(bookPath)) {      fs.renameSync(oldBookPath, bookPath)    }    this.fileName = filename // 文件名    this.path = `/book/${filename}${suffix}`// epub文件相对路径    this.filePath = this.path    this.unzipPath = `/unzip/${filename}`// epub解压后相对路径    this.url = url // epub文件下载链接    this.title = &#39;&#39;// 书名    this.author = &#39;&#39;// 作者    this.publisher = &#39;&#39;// 出版社    this.contents = [] // 目录    this.contentsTree = [] // 树状目录结构    this.cover = &#39;&#39;// 封面图片URL    this.coverPath = &#39;&#39;// 封面图片路径    this.category = -1// 分类ID    this.categoryText = &#39;&#39;// 分类名称    this.language = &#39;&#39;// 语种    this.unzipUrl = unzipUrl // 解压后文件夹链接    this.originalName = originalname // 电子书文件的原名  } |
| ------------------------------------------------------------ |

和从表单对象中创建 Book 对象。

|   createBookFromData(data) {    this.fileName = data.fileName    this.cover = data.coverPath    this.title = data.title    this.author = data.author    this.publisher = data.publisher    this.bookId = data.fileName    this.language = data.language    this.rootFile = data.rootFile    this.originalName = data.originalName    this.path = data.path || data.filePath    this.filePath = data.path || data.filePath    this.unzipPath = data.unzipPath    this.coverPath = data.coverPath    this.createUser = data.username    this.createDt = new Date().getTime()    this.updateDt = new Date().getTime()    this.updateType = data.updateType === 0 ? data.updateType : 1    this.category = data.category || 99    this.categoryText = data.categoryText || &#39;自定义&#39;    this.contents = data.contents || []  } |
| --- |

创建Book对象后，初始化后，可以调用 Book 实例的 parse 方法解析电子书，这里使用了 github上的epub 库，直接将 epub 库源码集成到项目中。epub 库源码为[https://github.com/julien-c/epub](https://github.com/julien-c/epub)，并使用epub库解压电子书。解压过程中包括基础的异常处理。

|   parse() {    returnnew Promise((resolve, reject) =\&gt; {      const bookPath = `${UPLOAD\_PATH}${this.filePath}`      if (!fs.existsSync(bookPath)) {        reject(new Error(&#39;电子书不存在&#39;))      }      const epub = new Epub(bookPath)      epub.on(&#39;error&#39;, err =\&gt; {        reject(err)      })      epub.on(&#39;end&#39;, err =\&gt; {        if (err) {          reject(err)        } else {          const {            language,            creator,            creatorFileAs,            title,            cover,            publisher          } = epub.metadata          if (!title) {            reject(new Error(&#39;图书标题为空&#39;))          } else {            this.title = title            this.language = language || &#39;en&#39;            this.author = creator || creatorFileAs || &#39;unknown&#39;            this.publisher = publisher || &#39;unknown&#39;            this.rootFile = epub.rootFile            const handleGetImage = (err, file, mimeType) =\&gt; {              if (err) {                reject(err)              } else {                const suffix = mimeType.split(&#39;/&#39;)[1]                const coverPath = `${UPLOAD\_PATH}/img/${this.fileName}.${suffix}`                const coverUrl = `${UPLOAD\_URL}/img/${this.fileName}.${suffix}`                fs.writeFileSync(coverPath, file, &#39;binary&#39;)                this.coverPath = `/img/${this.fileName}.${suffix}`                this.cover = coverUrl                resolve(this)              }            }            try {              this.unzip()              this.parseContents(epub).then(({ chapters, chapterTree }) =\&gt; {                this.contents = chapters                this.contentsTree = chapterTree                epub.getImage(cover, handleGetImage)              })            } catch (e) {              reject(e)            }          }        }      })      epub.parse()    })  } |
| --- |

电子书解析过程中我们需要自定义电子书目录解析，第一步需要对电子书进行解压，转变为解压后的zip文件。

![](RackMultipart20220708-1-mylsl2_html_b8e05cfbec94c85f.png)、

通过递归式访问来实现嵌套目录解析算法。

![](RackMultipart20220708-1-mylsl2_html_75f58fb7b903c474.png)

# 3. 运行截图

## 3.1 核心页面

图书上传：

![](RackMultipart20220708-1-mylsl2_html_1ce3a2b93decda19.png)

大文件：

![](RackMultipart20220708-1-mylsl2_html_2b41a903938c0fd2.png)

嵌套目录解析：

![](RackMultipart20220708-1-mylsl2_html_267ff767d4e51e4f.png)

多语言：

![](RackMultipart20220708-1-mylsl2_html_40942386dad95617.png)

![](RackMultipart20220708-1-mylsl2_html_f94ff197d15de86b.png)

异常处理：

![](RackMultipart20220708-1-mylsl2_html_dd70655a5967e62e.png)

![](RackMultipart20220708-1-mylsl2_html_871f04fec83c5656.png)

图书列表：

![](RackMultipart20220708-1-mylsl2_html_3cda8bd54e2b7024.png)

![](RackMultipart20220708-1-mylsl2_html_da1e79ff93bf0b8.png)

## 3.2 非核心页面

![](RackMultipart20220708-1-mylsl2_html_f7698a8f9030a364.png)

![](RackMultipart20220708-1-mylsl2_html_cc8a4bf86aa69f20.png) ![](RackMultipart20220708-1-mylsl2_html_728084ef318533cb.png) ![](RackMultipart20220708-1-mylsl2_html_c8e31c3cb8288617.png) ![](RackMultipart20220708-1-mylsl2_html_e08c16d7b28015e4.png) ![](RackMultipart20220708-1-mylsl2_html_c8e7aa8bad13ac45.png) ![](RackMultipart20220708-1-mylsl2_html_951ed6b92b3e62ba.png) ![](RackMultipart20220708-1-mylsl2_html_6378bfbdc26c7186.png) ![](RackMultipart20220708-1-mylsl2_html_35af5fef0b661019.png)

**读书前端系统**

# 1 版本迭代过程

0.1

书城、书架页面的基本实现，包括布局、基本结构（使用静态模拟数据进行测试）。实现的页面有：书城首页、搜索页面、搜索结果页面、分学科展示页面、书架页面、听书页、书籍详情页面、精选推荐页面、随机推荐页面、编辑书架内容界面。

0.2

页面UI优化；搜索功能实现；书架书籍添加删除功能实现；各页面切换跳转的检查、调整与优化。

0.3

联调阅读器和书籍详情，使用户可以通过书籍详情页跳转到阅读器并进行阅读（前端内容合并）；联调前端和后端，使项目基本成型。

0.4

通过科大讯飞提供的API，实现听书功能。

# 2 技术实现

项目前端书城、书架页使用vue-cli 3.0、HTML5、CSS、Javascript进行开发，项目的重难点在于：UI设计、与后端的交互（发送请求、处理返回数据）。在开发过程中，实现整个项目的流程是：书城首页框架页面+路由配置书城首页标题+搜索框 布局、交互热门搜索布局、交互实现书城首页推荐页面实现；书架标题组件布局、交互书架搜索框布局、交互书架数据获取实现书架图书列表实现书架图书编辑功能开发；听书页布局、交互听书API接入。

在开发过程中，页面的内容布局和交互实现的方法和路径代码较为简单，困难的是思路上的突破，UI设计上的和谐。此处以搜索栏组件为例，展示省略CSS的代码：

| \&lt;template\&gt;   \&lt;div\&gt;    \&lt;divclass=&quot;search-bar&quot; :class=&quot;{&#39;hide-title&#39;: !titleVisible, &#39;hide-shadow&#39;: !shadowVisible}&quot;\&gt;      \&lt;transitionname=&quot;title-move&quot;\&gt;        \&lt;divclass=&quot;search-bar-title-wrapper&quot;v-show=&quot;titleVisible&quot;\&gt;          \&lt;divclass=&quot;title-text-wrapper&quot;\&gt;            \&lt;spanclass=&quot;title-text title&quot;\&gt;{{$t(&#39;home.title&#39;)}}\&lt;/span\&gt;          \&lt;/div\&gt;          \&lt;divclass=&quot;title-icon-shake-wrapper&quot; @click=&quot;showFlapCard&quot;\&gt;            \&lt;spanclass=&quot;icon-shake icon&quot;\&gt;\&lt;/span\&gt;          \&lt;/div\&gt;        \&lt;/div\&gt;      \&lt;/transition\&gt;      \&lt;divclass=&quot;title-icon-back-wrapper&quot; :class=&quot;{&#39;hide-title&#39;: !titleVisible}&quot; @click=&quot;back&quot;\&gt;        \&lt;spanclass=&quot;icon-back icon&quot;\&gt;\&lt;/span\&gt;      \&lt;/div\&gt;      \&lt;divclass=&quot;search-bar-input-wrapper&quot; :class=&quot;{&#39;hide-title&#39;: !titleVisible}&quot;\&gt;        \&lt;divclass=&quot;search-bar-blank&quot; :class=&quot;{&#39;hide-title&#39;: !titleVisible}&quot;\&gt;\&lt;/div\&gt;        \&lt;divclass=&quot;search-bar-input&quot;\&gt;          \&lt;spanclass=&quot;icon-search icon&quot;\&gt;\&lt;/span\&gt;          \&lt;inputclass=&quot;input&quot;                 type=&quot;text&quot;                 :placeholder=&quot;$t(&#39;home.hint&#39;)&quot;                 v-model=&quot;searchText&quot;                 @click=&quot;showHotSearch&quot;                 @keyup.13.exact=&quot;search&quot;\&gt;        \&lt;/div\&gt;      \&lt;/div\&gt;    \&lt;/div\&gt;    \&lt;hot-search-listv-show=&quot;hotSearchVisible&quot; ref=&quot;hotSearch&quot;\&gt;\&lt;/hot-search-list\&gt;  \&lt;/div\&gt;\&lt;/template\&gt;\&lt;script\&gt;  import { storeHomeMixin } from &#39;../../utils/mixin&#39;  import HotSearchList from &#39;./HotSearchList&#39;
  export default {    components: { HotSearchList },    mixins: [storeHomeMixin],    data() {      return {        searchText: &#39;&#39;,        titleVisible: true,        shadowVisible: false,        hotSearchVisible: false      }    },    watch: {      offsetY(offsetY) {        if (offsetY \&gt; 0) {          this.hideTitle()          this.showShadow()        } else {          this.showTitle()          this.hideShadow()        }      },      hotSearchOffsetY(offsetY) {        if (offsetY \&gt; 0) {          this.showShadow()        } else {          this.hideShadow()        }      }    },    methods: {      search() {        this.$router.push({          path: &#39;/store/list&#39;,          query: {            keyword: this.searchText          }        })      },      showFlapCard() {        this.setFlapCardVisible(true)      },      back() {        if (this.offsetY \&gt; 0) {          this.showShadow()        } else {          this.hideShadow()        }        if (this.hotSearchVisible) {          this.hideHotSearch()        } else {          this.$router.push(&#39;/store/shelf&#39;)        }      },      showHotSearch() {        this.hideTitle()        this.hideShadow()        this.hotSearchVisible = true        this.$nextTick(() =\&gt; {          this.$refs.hotSearch.reset()        })      },      hideHotSearch() {        this.hotSearchVisible = false        if (this.offsetY \&gt; 0) {          this.hideTitle()          this.showShadow()        } else {          this.showTitle()          this.hideShadow()        }      },      hideTitle() {        this.titleVisible = false      },      showTitle() {        this.titleVisible = true      },      hideShadow() {        this.shadowVisible = false      },      showShadow() {        this.shadowVisible = true      }    }  }\&lt;/script\&gt;

 |
| --- |

在前后端分离开发的实现中，向后端发送请求和响应后端的请求并解析后端返回数据是重中之中。在实现向后端发送请求时，使用HTTP get/post 请求；解析返回数据时，使用vue.js 或javascript函数。

发送请求代码示例：

// 向后端发送请求的js函数

exportfunction flatList() {

  return axios({

    method: &#39;get&#39;,
    
    url: `${process.env.VUE\_APP\_BOOK\_URL}/book/flat-list`

  })

}

exportfunction shelf() {

  return axios({

    method: &#39;get&#39;,
    
    url: `${process.env.VUE\_APP\_BASE\_URL}/book/shelf`

  })

}

exportfunction list() {

  return axios({

    method: &#39;get&#39;,
    
    url: `${process.env.VUE\_APP\_BASE\_URL}/book/list`

  })

}

exportfunction download(book, onSucess, onError, onProgress) {

  if (onProgress == null) {

    onProgress = onError
    
    onError = null

  }

  return axios.create({

    baseURL: process.env.VUE\_APP\_EPUB\_URL,
    
    method: &#39;get&#39;,
    
    responseType: &#39;blob&#39;,
    
    timeout: 180 \* 1000,
    
    onDownloadProgress: progressEvent =\&gt; {
    
      if (onProgress) onProgress(progressEvent)
    
    }

  }).get(`${book.categoryText}/${book.fileName}.epub`)

    .then(res =\&gt; {
    
      const blob = new Blob([res.data])
    
      setLocalForage(book.fileName, blob,
    
        () =\&gt; onSucess(book),
    
        err =\&gt; onError(err))
    
    }).catch(err =\&gt; {
    
      if (onError) onError(err)
    
    })

}

 ![Shape1](RackMultipart20220708-1-mylsl2_html_ec3e7a1fd2bf5de7.gif)

处理返回数据的代码示例：

// 通过API找到当前电子书的详情数据

      findBookFromList(fileName) {
    
        flatList().then(response =\&gt; {
    
          if (response.status === 200) {
    
            const bookList = response.data.data.filter(item =\&gt; item.fileName === fileName)
    
            if (bookList &amp;&amp; bookList.length \&gt; 0) {
    
              this.bookItem = bookList[0]
    
              this.init()
    
            }
    
          }
    
        })
    
      },
    
      // 初始化参数信息
    
      init() {
    
        const fileName = this.$route.query.fileName
    
        if (!this.bookItem) {
    
          this.bookItem = findBook(fileName)
    
        }

//为减少篇幅，省略部分代码

      // 解析电子书
    
      parseBook(blob) {
    
        // 解析电子书
    
        this.book = new Epub(blob)
    
        // 获取电子书的metadata
    
        this.book.loaded.metadata.then(metadata =\&gt; {
    
          this.metadata = metadata
    
        })
    
        // 获取电子书的目录信息
    
        this.book.loaded.navigation.then(nav =\&gt; {
    
          this.navigation = nav
    
        })
    
        // 渲染电子书
    
        this.display()
    
      },

 ![Shape2](RackMultipart20220708-1-mylsl2_html_4f600665eab55042.gif)

# 3 页面展示

![](RackMultipart20220708-1-mylsl2_html_e6c77fc4acb6390c.png)

书城首页

![](RackMultipart20220708-1-mylsl2_html_c66160c777f2d22d.png)

分类页面

![](RackMultipart20220708-1-mylsl2_html_23743720abc91dc6.png)

按学科分类展示书籍

![](RackMultipart20220708-1-mylsl2_html_29d56d0dc8acf018.png)

书籍详情页

![](RackMultipart20220708-1-mylsl2_html_9cd9b249479d7203.png)

听书页

![](RackMultipart20220708-1-mylsl2_html_3d8e406fab44c906.png)

搜索页

![](RackMultipart20220708-1-mylsl2_html_acbdd257f5bb0662.png)

搜索结果页

![](RackMultipart20220708-1-mylsl2_html_3a3ce91f3c812648.png)

书架页

![](RackMultipart20220708-1-mylsl2_html_e3d64e8882e37ecc.png)

编辑书架页面

![](RackMultipart20220708-1-mylsl2_html_d14ce256cf9f6f67.png)

随机推荐页面

![](RackMultipart20220708-1-mylsl2_html_74fa09cb51dd0b96.png)

精选页面