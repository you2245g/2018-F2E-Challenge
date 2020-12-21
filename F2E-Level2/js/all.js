
new Vue({

    el:'#wrapper',
    data:{
        filterSelect:[],  //for篩選器選取
        url:'https://raw.githubusercontent.com/hexschool/KCGTravel/master/datastore_search.json', //json檔案
        //分頁控制變數
        searchResult:'',   //顯示目前分頁數
        totalPages:0,      //總分頁數
        limitPerPage:3,    //分頁限制數(設定為三頁)
        current:0,
    },
    mounted(){
        this.display(0); //手機版table預設
        this.loadJsonZone();  //讀取json(for區域)
        this.loadJsonFilter('三民區');  //預設為三民區
        //$('section').hide()
        $('.detail').hide()
    },
    watch:{
        //filterSelect陣列值監聽
        filterSelect:function(filterSelect){
            $('.selectBoard').html('');
            let add = '';            
            for(i = 0;i<filterSelect.length;i++){
                add +=`
                    <div data-num="${i}">
                        ${filterSelect[i]}
                        <i data-num="${i}" class="far fa-times-circle"></i>
                    </div>
                    `
                    ;
            }
            $('.selectBoard').append(add);
        },
    },
    methods:{
        //table點按事件
        tableKeyEvent(event){
            let vm = this
            let key = event.target.dataset.num;
            vm.display(key);
        },
        display(key){
            let check = $(`aside > div:eq(${key}) > h2 > span > i`).attr('class');  //產生檢查子
            let windowWidth = $(window).width();

            if(windowWidth >= 768){return}  //若視窗寬度超過768，點按則無效
            if(check === 'fa fa-plus'){
                $(`aside > div:eq(${key})`).css('background-color',' #EBEBEB');
                $(`aside > div:eq(${key}) > h2`).css('padding-bottom','15px');
                $(`aside > div > div:eq(${key})`).css('display','block');
                $(`aside > div:eq(${key}) > h2 > span > i`).removeClass("fa-plus");
                $(`aside > div:eq(${key}) > h2 > span > i`).addClass("fa-minus");
            }else if(check === 'fa fa-minus'){
                $(`aside > div:eq(${key})`).removeAttr("style");
                $(`aside > div:eq(${key}) > h2`).removeAttr("style");
                $(`aside > div > div:eq(${key})`).removeAttr("style");
                $(`aside > div:eq(${key}) > h2 > span > i`).removeClass("fa-minus");
                $(`aside > div:eq(${key}) > h2 > span > i`).addClass("fa-plus");
            }
        },
        //刪除select事件(針對陣列刪除)
        deleteSelect(event){
            let vm = this;
            let key = event.target.dataset.num;
            if(key == undefined){return}
            vm.filterSelect.splice(key,1);
        },
        //載入json檔(for區域選單)
        loadJsonZone(){
            let vm = this;
            let data = [];
            axios.get(vm.url)
            .then(function(response){
                data = response.data.result.records;   //取出json檔檔案內容

                //區域段-迴圈取得區域
                let county = [];
                data.forEach(function(item){
                    county.push(item.Zone);
                });
                //過濾重複區域
                let countyTrue = county.filter((item, key, array) => {
                    return array.indexOf(item) === key;   //過濾取出22個縣市陣列
                });
                //置入HTML
                let str = '';
                str +='<option value="">請選擇縣市</option>';
                countyTrue.forEach(function(item){
                    str +=
                    `
                    <option value="${item}">${item}</option>
                    `
                    ;
                });
                $('#selectZone').append(str);

            })
            .catch(function (error) {
                console.log(error);
            });
        },
        //資料渲染畫面(filter查找)
        loadJsonFilter(county){
            let vm = this;
            let data = [];
            axios.get(vm.url)
            .then(function(response){
                data = response.data.result.records;   //取出json檔檔案內容

                let str = '';

                data.forEach(function(item,index,array){
                    if(item.Zone === county){
                                        
                        //電話文字顯示
                        let Tel = [];
                        Tel.push(item.Tel);
                        //07-格式電話號碼
                        let showTel = []; //07電話格式
                        let callTel = []; //+886電話格式
                        Tel.forEach(function(item , key, array){
                            showTel.push(item.replace('886-7','07'));
                            callTel.push(item.replace('886-7-','+8867'));
                        })
                        
                        //說明文字簡略
                        let Description = [];
                        Description.push(item.Description);
                        let simpleDescription = [];
                        Description.forEach(function(item , key, array){
                            simpleDescription.push(item.slice(0,99).concat('......<br><span style="font-size:14px">(詳全文)</span>'));
                        })

                        //展示搜尋區域顯示(.content > .block)
                        str +=
                        `
                        <div data-num="${index}" class="block">
                            <div data-num="${index}" style="background-image: url(${item.Picture1});">
                            </div>  
                            <div data-num="${index}">
                                <h3 data-num="${index}">${item.Name}</h3>
                                <p data-num="${index}" class="Description">
                                ${simpleDescription}
                                </p>
                                <p class="tagName">
                                    <span>Entertainment</span>
                                </p>
                                <p class="info">
                                    <span class="Zone">
                                        <a href="https://www.google.com.tw/maps/place/${item.Add}">
                                            <i class="fas fa-map-marker-alt"></i>
                                            ${item.Zone}
                                        </a>
                                    </span>
                                    <span class="Tel">
                                        <a href="tel:${callTel}">
                                            <i class="fas fa-phone"></i>
                                            ${showTel}
                                        </a>
                                    </span>
                                    <span data-num="${index}" class="Opentime">
                                        <i class="far fa-calendar-alt"></i>
                                        ${item.Opentime}
                                    </span>
                                </p>
                            </div>
                        </div>
                        `
                        ;
                    } 
                });
                $('.content').html('').append(str);
                vm.searchResult = $('.block').length;   //計算block長度
                vm.pagination();  //執行pagination
            })
            .catch(function (error) {
                console.log(error);
            });

        },
        //表單change事件
        filterChange(event){
            let vm = this;
            let key = event.target.value;
            if(key === ''){return}  //如果選擇空值則不作以下動作         
            vm.loadJsonFilter(key); //將值傳入loadJsonFilter裡
            $('.detail').hide();    //隱藏.detail
            $('section').show();    //顯示section
        },
        //pagination分頁設定
        pagination(){
            let vm = this;
            let str = '';
            vm.totalPages = Math.ceil(vm.searchResult / vm.limitPerPage);  //取得分頁數(現有區塊 / 分頁區塊)的無條件進位
            $('.pagination').html('');  //每次執行時要清空內容
            $('.content > .block:gt(' + (vm.limitPerPage - 1) + ')').hide(); //隱藏多出來的區塊分頁

            //append入.pagination區塊
            str += '<div data-name="pre"> &laquo; </div>'
            // 取得分頁tab
            for (var i = 1; i <= vm.totalPages; i++) {
                str += `<div data-name="${i}">${i}</div>`;
            }
            //增加下一頁按鈕
            str += '<div data-name="next"> &raquo; </div>';
            $('.pagination').append(str);
            //active初始設置
            $(`.pagination > div:eq(1)`).addClass('active'); 
        },
        //點按pagination div切換分頁
        changePage(event){
            let vm = this
            let key = event.target.dataset.name;  //點按取得dataset key
            let current = $(".pagination div.active").index();
            let nowNum = '';  //迴圈後得出的數字
            //點按事件判斷
            if(key === 'pre'){  //如果key為上一頁
                if(current === 1){return}
                nowNum = current-1;
            }else if(key === 'next') {  //如果key為下一頁
                if(current === vm.totalPages){return}
                nowNum = current+1;
            } else{  //如果key為數字
                if(current == key){return}  
                nowNum = key
            }
            //外觀改變
            $('.pagination div').removeClass('active');
            $(`.pagination div:eq(${nowNum})`).addClass('active');
            //分頁判斷
            let grandTotal = nowNum * vm.limitPerPage;  //取得需顯示的區塊數起始
            $('.content > .block').hide();  //隱藏目前div區塊
            for(let i = grandTotal - vm.limitPerPage; i < grandTotal; i++){
                $(`.content > .block:eq(${i})`).show();
            }
            //點按後回頁頂
            $("html,body").animate({"scrollTop":"0"});  
        },
        //日期pickup
        datePick(){
            document.activeElement.blur()
            $('.dateChoose').datepicker();
        },
        //點選block，顯示介紹
        showDetail(event){
            let vm = this
            key = event.target.dataset.num; //取得序列號
            
            let data = [];
            if(key == undefined){return}  //如果key為undefined，則彈回
            axios.get(vm.url)
            .then(function(response){
                data = response.data.result.records;   //取出json檔檔案內容

                let showTel = data[key].Tel.replace('886-7','07');
                let callTel = data[key].Tel.replace('886-7','+8867');

                $('section').hide();   //隱藏section畫面
                let str = '';          //加入資料
                str +=
                `
                <div class="breadCrumbs">
                    <span data-name="back">Explore</span>
                    /
                    <span class="placeName">${data[key].Name}</span>
                </div>
                <div class="detailContent">
                    <div class="imgBack" style="background-image: url(${data[key].Picture1});">
                    </div>
                    <div class="detailArticle">
                        <h3>${data[key].Name}</h3>
                        <p class="tagName">
                            <span>Entertainment</span>
                        </p>
                        <p class="info">
                            <span class="Tel">
                                <a href="tel:${callTel}">
                                    <i class="fas fa-phone"></i>
                                    ${showTel}
                                </a>
                            </span>
                            <span class="Zone"><br>
                                <a href="https://www.google.com.tw/maps/place/${data[key].Add}">
                                    <i class="fas fa-map-marker-alt"></i>
                                    ${data[key].Add}
                                </a>
                            </span>
                            <span class="Opentime"><br>
                                <i class="far fa-calendar-alt"></i>
                                ${data[key].Opentime}
                            </span>
                        </p>
                        <div class="Description">
                            ${data[key].Description}
                        </div>
                    </div>
                </div>
                <div class="backKey" data-name="back">
                    回上一頁
                </div>
                `
                ;
                $("html,body").animate({"scrollTop":"0"});
                $('.detail').html('').append(str);
                $('.detail').show();
            })
            .catch(function (error) {
                console.log(error);
            });
        },
        //點nav explorer回首頁
        backHome(event){
            let key = event.target.dataset.name;
            if(key === 'back'){
                $('.detail').hide();
                $('section').show();
                $("html,body").animate({"scrollTop":"0"}); 
            }
        },
    },
})

