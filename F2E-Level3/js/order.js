
new Vue({

    el:'#wrapper',
    data:{
        //info選取框
        toggleData:['Select All', 'Unselect', 'Paid', 'Unpaid', 'Shipping', 'Done'],
        hoverData:['Order ID', 'Customer', 'Product List', 'Total', 'Add to Cart', 'Check-out', 'Address', 'Phone', 'E-mail', 'Status'],
        //分頁控制變數
        dataResults:$('table > tbody > tr').length,   //顯示目前分頁數
        totalPages:0,      //總分頁數
        limitPerPage:7,    //分頁限制數(設定為五頁)
        //product資料數
        productDataNum:10, //目前預設為15筆
    },
    mounted(){
        this.loadingData();  //loading資料
        this.pagination(this.productDataNum);
    },
    watch:{
        dataResults:function(dataPage){
            this.pagination(dataPage);
        }
    },
    methods:{
        //點按選單出現(for 共同框)
        toggle(){
            $('nav > ul').slideToggle("slow");
        },
        //分頁判斷
        pagination(dataPage){
            let vm = this;
            let str = '';
            vm.totalPages = Math.ceil(dataPage / vm.limitPerPage); //總頁數

            $('.pagination').html('');  //每次執行時要清空內容
            $('table > tbody > tr:gt(' + (vm.limitPerPage - 1) + ')').hide(); //隱藏多出來的區塊分頁

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
        //分頁列點按
        changePage(event){
            let vm = this;
            let key = event.target.dataset.name;
            let current = $(".pagination div.active").index();  //active目前所在位置
            let nowNum = '';  //迴圈後得出的數字

            //點按事件判斷
            if(key == undefined){return}
            if(key === 'pre'){  //如果key為上一頁
                if(current == 1){return}
                nowNum = current-1;
            }else if(key === 'next') {  //如果key為下一頁
                if(current == vm.totalPages){return}
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
            $('table > tbody > tr').hide();  //隱藏目前div區塊
            for(let i = grandTotal - vm.limitPerPage; i < grandTotal; i++){
                $(`table > tbody > tr:eq(${i})`).show();
            }
            //點按後回頁頂
            $("html,body").animate({"scrollTop":"0"}); 
            
        },
        //左勾選單點選功能
        clickBlock(){
            $('.clickList').slideToggle("slow");
        },
        clickChange(event){
            let vm = this;
            let key = event.toElement.innerText;
            let index = vm.toggleData.indexOf(key);
            //添加樣式
            $('.clickList > p').attr('class','');
            $(`.clickList > p:eq(${index})`).attr('class',`active`);
            //將選單拉回去
            $('.clickList').slideToggle("slow");
        },
        //loading資料
        loadingData(){
            let vm = this
            let str = '';

            for(let i = 0;i <vm.productDataNum; i++){
                str +=
                `
                <tr>
                    <td>
                        <label>
                            <input type="checkbox">
                            <span></span>
                        </label>
                        George Walker Bush
                    </td>
                    <td>
                        <div class="item">
                            <p>Vestibulum.</p>
                            <div>
                                <span>$1,400</span>
                                <span>1</span>
                            </div>
                        </div>
                        <div class="item">
                            <p>Vestibulum.</p>
                            <div>
                                <span>$1,400</span>
                                <span>1</span>
                            </div>
                        </div>
                    </td>
                    <td>$2,200</td>
                    <td>
                        2018/6/8<br>
                        13:39
                    </td>
                    <td>
                        2018/6/8<br>
                        20:23
                    </td>
                    <td>
                        386 Windler Drives<br>
                        Apt. 358
                    </td>
                    <td>
                        <div class="select">
                            <p class="Paid">
                                Paid
                                <i class="fas fa-caret-down"></i>
                            </p>
                            <div class="list">
                                <p data-num="${i}" data-name="Paid" class="active">Paid</p>
                                <p data-num="${i}" data-name="Unpaid">Unpaid</p>
                                <p data-num="${i}" data-name="Shipping">Shipping</p>
                                <p data-num="${i}" data-name="Done">Done</p>
                            </div>
                        </div>
                    </td>
                </tr>
                `
                ;
            }
            $('table > tbody').append(str);
            
        },
        //table鈕動態
        statusChange(event){
            let key = event.target.dataset.num;
            let status = event.toElement.innerText;
            let index = $(`table > tbody > tr:eq(${key}) > td > .select > .list > p[data-name=${status}]`).index();

            let str = 
            `
            ${status}
            <i class="fas fa-caret-down"></i>
            `
            ;
            if(key == undefined){return}
            //按鈕active狀態變更
            $(`table > tbody > tr:eq(${key}) > td > .select > .list > p`).attr('class','');
            $(`table > tbody > tr:eq(${key}) > td > .select > .list > p:eq(${index})`).attr('class','active');
            //更換css樣式
            $(`table > tbody > tr:eq(${key}) > td > .select > p`).attr('class','');
            $(`table > tbody > tr:eq(${key}) > td > .select > p`).attr('class',`${status}`);
            //更換文字
            $(`table > tbody > tr:eq(${key}) > td > .select > p`).text('');
            $(`table > tbody > tr:eq(${key}) > td > .select > p`).append(str);
            //Unpaid內文狀態設定
            let check = $(`table > tbody > tr:eq(${key}) > td > .select > p`).attr('class');
            if(check === 'Unpaid'){
                $(`table > tbody > tr:eq(${key})`).attr('class','unuse');
            } else{
                $(`table > tbody > tr:eq(${key})`).attr('class','');
            }
        },



    },

})




