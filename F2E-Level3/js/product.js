
new Vue({

    el:'#wrapper',
    data:{
        toggleData:['Select All', 'Unselect', 'Paid', 'Unpaid', 'Shipping', 'Done'],
        //分頁控制變數
        dataResults:$('table > tbody > tr').length,   //顯示目前分頁數
        totalPages:0,      //總分頁數
        limitPerPage:5,    //分頁限制數(設定為五頁)
        //product資料數
        productDataNum:11, //目前預設為10筆
    },
    mounted(){
        this.productData(); //產品內容資料
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
        clickBlock(){
            $('.clickList').slideToggle("slow");
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
        //select選單鈕
        toggleDataSelect(event){
            let vm = this;
            let key = event.toElement.innerText;
            let index = vm.toggleData.indexOf(key);
            //填入css
            $(`.clickList > p`).attr('class','');
            $(`.clickList > p:eq(${index})`).attr('class','active');

            $(`.clickList`).slideToggle('slow');
        },
        //product動態
        //點擊add New Product顯形
        addProduct(){
            $('.addProduct').css('display','block');
        },
        //點擊add New Product隱形
        clickHide(){
            let vm = this;
            $('.addProduct').css('display','none');
            //清空所有內容
            $('.addProduct > .index > .content > .right > textarea').val('');
            $('input:text').val('');
            $('.spec').remove();  //移除所有的.spec html元素
            vm.addSpec();
        },
        //addNewSpec新增欄位
        addSpec(){
            let str =
            `
            <div class="spec rowInput">
                <p>Size</p>
                <select>
                    <option value="L">L</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                </select>
                <p>Color</p>
                <input type="text" placeholder="">
                <p>Inventory</p>
                <input type="text" placeholder="">
            </div>
            `
            ;
            $('.addSpec').before(str);
        },
        //table資料
        //狀態變更
        statusChange(event){
            if(event.target.dataset.num == undefined){return}
            let status = event.target.dataset.name;
            let num = event.target.dataset.num;
            //append方法
            let str = 
            `
            ${status}
            <i class="fas fa-caret-down"></i>
            `
            ;
            $(`tbody > tr:eq(${num}) > td > .select > p`).html('');
            $(`tbody > tr:eq(${num}) > td > .select > p`).append(str);
            //選單底下active設置
            let key = $(`tbody > tr:eq(${num}) > td > .select > .list > p[data-name=${status}]`).index();
            $(`tbody > tr:eq(${num}) > td > .select > .list > p`).attr('class','');
            $(`tbody > tr:eq(${num}) > td > .select > .list > p:eq(${key})`).attr('class','active');
            //按鈕class外觀
            $(`tbody > tr:eq(${num}) > td > .select > p`).attr('class',`${status}`);
            //tr加上status
            $(`tbody > tr:eq(${num})`).attr('data-status',`${status}`);
            //Unpaid內文狀態設定
            let check = $(`table > tbody > tr:eq(${num}) > td > .select > p`).attr('class');
            if(check === 'Unpaid'){
                $(`table > tbody > tr:eq(${num})`).attr('class','unuse');
            } else{
                $(`table > tbody > tr:eq(${num})`).attr('class','');
            }
        },
        //tbody資料進入
        productData(){
            let vm = this;
            let str = ''
            for(let i =0; i<vm.productDataNum;i++){
                str += 
                `
                <tr data-status="Unpaid">
                    <td>
                        <label>
                            <input type="checkbox">
                            <span></span>
                        </label>
                        <div>
                            <img src="img/index01.png">
                        </div>
                        <p>Mauris non tem.</p>
                    </td>
                    <td>$2,200</td>
                    <td>$2,200</td>
                    <td colspan="3">
                        <div class="item">
                            <div>
                                L
                            </div>
                            <div>
                                <span>Gray</span><br>
                                <span class="lastSpan">Black</span>
                            </div>
                            <div class="i">
                                <span>15</span><br>
                                <span class="lastSpan">20</span>
                            </div>
                        </div>
                        <div class="item">
                            <div>
                                L
                            </div>
                            <div>
                                <span>Gray</span><br>
                                <span class="lastSpan">Black</span>
                            </div>
                            <div class="i">
                                <span>15</span><br>
                                <span class="lastSpan">20</span>
                            </div>
                        </div>
                        <div class="item">
                            <div>
                                L
                            </div>
                            <div>
                                <span>Gray</span><br>
                                <span class="lastSpan">Black</span>
                            </div>
                            <div class="i">
                                <span>15</span><br>
                                <span class="lastSpan">20</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="select">
                            <p class="Paid">
                                Paid
                                <i class="fas fa-caret-down"></i>
                            </p>
                            <div class="list">
                                <p data-name="Paid" data-num="${i}" class="active">Paid</p>
                                <p data-name="Unpaid" data-num="${i}">Unpaid</p>
                                <p data-name="Shipping" data-num="${i}">Shipping</p>
                                <p data-name="Done" data-num="${i}">Done</p>
                            </div>
                        </div>
                    </td>
                </tr>                  
                `
                ;
                $('.index > table > tbody').html(str);
            }
        },


    },

})




