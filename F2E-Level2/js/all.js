let nn = new Vue({

    el:'#wrapper',
    data:{
        yes: ['全天候開放','免費參觀'],
        no: '',
        rowData:[],     //json資料列
        countyTrue:[],  //縣市列表
        filterData:[],  //經篩選後的資料
        filterSelect:[], //篩選條件顯示於面版
        checkBox:{
            全天候開放:"Opentime",
            免費參觀:"Ticketinfo",
        },
        url:'https://raw.githubusercontent.com/hexschool/KCGTravel/master/datastore_search.json', //json檔案
        //分頁控制變數
        searchResult:'',   //搜尋總長度
        totalPages:0,      //總分頁數
        limitPerPage:3,    //分頁限制數(設定為三頁)
        nowNum:0,          //現在頁數
        //搜尋條件
        typeSearch:'',  //文字搜索
        criteria:{      //選擇搜索
            Opentime:'',   //全天候開放
            Ticketinfo:'', //免費參觀
            Zone:'',       //地區
        },
        //點按後顯現資料
        name:'',       //名稱
        Add:'',        //地址
        linkAdd:'',    //google連結地址
        showTel:'',    //顯示電話
        callTel:'',    //電話連結
        Opentime:'',   //開放時間
        Description:'',//詳細說明 
        imgUrl: '',    //相片網址
    },
    mounted(){
        this.display(0); //手機版table預設
        this.loadJsonZone();  //讀取json(for區域)
        $('.detail').hide();
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
        //載入json檔(for區域選單)
        loadJsonZone(){
            let vm = this;
            let data = [];
            axios.get(vm.url)
            .then(function(response){
                data = response.data.result.records;   //取出json檔檔案內容
                //複製資料於data
                vm.rowData = [...data];
                vm.filterData = [...data];
                //區域段-迴圈取得區域
                let county = [];
                data.forEach(function(item){ county.push(item.Zone) });
                //過濾重複區域(過濾取出22個縣市陣列)
                vm.countyTrue = county.filter((item, key, array) => { return array.indexOf(item) === key });
            })
            .catch(function (error) {
                console.log(error);
            });
        },
        //刪除filterSelect事件(影響選擇後資料)
        deleteSelect(event){
            let vm = this;
            let key = event.target.dataset.num;
            let nameKey = event.target.dataset.name;
            if(key == undefined){return}
            vm.filterSelect.splice(key,1); //陣列刪除

            if(nameKey ==='全天候開放'){
                vm.criteria['Opentime'] = "";
            }else if(nameKey ==='免費參觀'){
                vm.criteria['Ticketinfo'] = "";
            }else{ 
                $("#selectZone > option[value='']").removeAttr("selected")
                vm.criteria['Zone'] = "";
                $("#selectZone > option[value='']").attr("selected","selected");
            }

        },
        //表單change事件（地區篩選）
        filterChange(event){
            let vm = this;
            vm.criteria['Zone'] = event.target.value //回傳zone值，更改篩選條件
            $('.detail').hide();    //隱藏.detail
            $('section').show();    //顯示section
        },
        //點按pagination div切換分頁
        changePage(event){
            let vm = this
            let key = event.target.dataset.name;  //點按取得dataset key
            //點按事件判斷(決定nowNum)
            if(key === 'pre'){  //如果key為上一頁
                if(vm.nowNum == 1){return}
                vm.nowNum = vm.nowNum-1;
            }else if(key === 'next') {  //如果key為下一頁
                if(vm.nowNum === vm.totalPages){return}
                vm.nowNum = vm.nowNum+1;
            } else{  //如果key為數字
                if(vm.nowNum == key){return}  
                vm.nowNum = key
            }
            //分頁判斷
            let grandTotal = vm.nowNum * vm.limitPerPage;  //取得需顯示的區塊數起始
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
            id = event.target.dataset.num; //取得序列號
            let key = vm.rowData.findIndex( array => array._id == id );
            if(key == undefined){return}  //如果key為undefined，則彈回
            //置入資料
            let tel = vm.rowData[key].Tel;
            vm.name = vm.rowData[key].Picdescribe1;
            vm.Add = vm.rowData[key].Add;
            vm.linkAdd = `https://www.google.com.tw/maps/place/${vm.rowData[key].Add}`;
            vm.showTel = tel.replace('886-7','07'); 
            vm.callTel = tel.replace('886-7','+8867');  
            vm.Opentime = vm.rowData[key].Opentime;
            vm.Description = vm.rowData[key].Description;
            vm.imgUrl = `background-image: url(${vm.rowData[key].Picture1});`;
            $("html,body").animate({"scrollTop":"0"});
            $('section').hide();   //隱藏section畫面
            $('.detail').show();
        },
        //點nav explorer回首頁
        backHome(){
            $('.detail').hide();
            $('section').show();
            $("html,body").animate({"scrollTop":"0"}); 
        },
    },
    computed:{  
        //提供加入filter條件
        displayData(){
            let vm = this;
            this.$nextTick(() => {  
                $('.content > .block').show() ;
                $('.content > .block:gt(' + (this.limitPerPage - 1) + ')').hide() ;
                this.nowNum = 1;
            }); //隱藏多出來的區塊分頁

            const filterKeys = Object.keys(vm.criteria);  //取得key值
            
            //條件搜尋
            let filterSelect =  vm.filterData.filter((item) => {  
                return filterKeys.every(key => {
                    if(!vm.criteria[key].length) return true
                    return !!~vm.criteria[key].indexOf(item[key])
                })
            })
            //文字搜尋條件
            if(vm.typeSearch === ''){ return filterSelect }
            return filterSelect.filter(item => item.Description.match(vm.typeSearch));
        }
    },
    watch:{
        //watch資料
        displayData:function(displayData){
            this.searchResult = displayData.length; //計算顯示資料總長度
            this.totalPages = Math.ceil(this.searchResult / this.limitPerPage);  //取得分頁數(現有區塊 / 分頁區塊)的無條件進位
        },
        //監聽篩選條件
        criteria:{
            handler:function(value){
                let keys = Object.values(value); //[取得值的陣列]
                let filterData = [];

                keys.forEach(function(item){
                    if(item == ''){return}
                    filterData.push(item)
                })
                this.filterSelect = filterData;
            },
            deep:true,
        },

    },
})
