// 負責控制tooltip，當有warn樣式名稱顯示沒有則關閉
$(() => {
    $('[data-toggle="tooltip"]').each(function(){ 

        let showHide = function(el){
            el.tooltip(el.hasClass('warn') ? 'show' : 'hide')
        }

        new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.attributeName === 'class' && showHide($(this))
            })
        }).observe(this, {attributes: true, characterData: false, childList: false});
        $(this).tooltip({ placement: 'right', trigger: 'manual' });
        showHide($(this));
    }) 
})

new Vue({

    el:"#wrapper",
    data:{
        //產生input檢查子條件
        check:{
            //第一頁檢查元素
            Email: val => /.+@.+\..+/.test(val), //回傳a@a.a格式的email
            Password(val){
                return /.{8,}/.test(this._password = val) //檢查八碼條件
            },
            ConfirmPassword(val){
                return this._password === val  //檢查上面帳號
            },
            //第二頁檢查元素
            PhoneNumber: val =>/^09\d{8}/.test(val), //驗證09開頭及末八碼
            Address: val => /[\u4e00-\u9fa5]/.test(val),  //驗證最起碼要有一個中文字(繁體中文字的範圍)
            //第三頁檢查元素(檢查照片)
            checkImage: ary => ary.length <= 3 && ary.every(file => file.width <= 150 || file.height <= 150),
            //第四頁檢查元素
            CVV: val => /.{3}/.test(val), //檢查是否到第三位數
            CreditCard(val){
                val = val.replace(/\s/g, '');
                let check = (/^4[0-9]{12}(?:[0-9]{3})?$/.test(val) && 'fa-cc-visa') ||
                (/^5[1-5][0-9]{14}$/.test(val) && 'fa-cc-mastercard') ||
                ''  //visa卡、master卡錯誤訊息
                if(check === ''){
                    $('.fab').attr('class','fab');
                    return false
                }else{
                    $('.fab').addClass(check);
                    return true
                }
            },
        },
        status:{},  //需檢證input狀態
        addFile:[], //第三頁上傳圖片暫存陣列
    },
    mounted(){
        this.fromToData();   //數字產出資料
        this.countySelect(); //產出縣市選項
    },
    methods:{
        //數字產出資料
        fromToData(){
            $('[data-from][data-to]').each(function(){
                let from = $(this).data('from');
                let to = $(this).data('to');
                let str = ''
                for(let i = from; i<=to ;i++){
                    str +=`<option value="${i}">${i}</option>`
                }
                $(this).append(str);
            });
        },
        //縣市區資料
        countySelect(){
            if($('.city').length ===0 && $('.region').length ===0){return}  //如果這兩個長度等於0，則彈回
            let data = []
            axios.get('data.json')
            .then(function (response) {
                data = JSON.parse(response.request.responseText);
                data.city.forEach(function(value,index){
                    $('.city').append(`<option value="${index}">${value}</option>`);
                });
            })
            .catch(function (error) {
                console.log(error);
            });
        },
        //選擇區域(option change事件)
        selectRegion(event){
            let key = event.target.value;
            axios.get('data.json')
            .then(function (response) {
                data = JSON.parse(response.request.responseText)
                $('.region').empty();
                data.region[key].forEach(function(value,index){
                    $('.region').append(`<option value="${index}">${value}</option>`);
                });
            })
            .catch(function (error) {
                console.log(error);
            });            
        },
        //取得input值並檢查(oninput事件)
        getCheckName(checkName){
            let vm = this;
            let key = checkName.target.name;  //個別取得name值
            let result = vm.check[key](checkName.target.value.trim()); //產生檢查值(true or false)
            //檢查樣板
            if(result){  //利用check條件檢查值
                $(`input[name=${key}]`).removeClass('warn');
                //$(`input[name=${key}]`).tooltip('hide');
            }
            else{
                $(`input[name=${key}]`).addClass('warn');
                //$(`input[name=${key}]`).tooltip('show');
            }
            //submit按鈕驗證
            vm.status[key] = result; //將值置入status
            let array = Object.keys(vm.status);
            let checkTrue = array.map(key => vm.status[key]).every(val => val);  //針對所有需驗證input產生true值
            if($('[data-toggle]').length === array.length && checkTrue){
                $('button').removeClass('disable');
                $('button').removeAttr('disabled');
            }else{
                $('button').addClass('disable');
                $('button').attr('disabled', 'disabled');
            }
        },
        //檢核keyup內容長度（是否出現符號、英文及長度過長情形）
        lengthCheck(event){
            let value = event.target.value;
            let code = event.keyCode;
            let nameKey = event.target.name;

            //判斷鍵盤被按下時，需限制內文字數或空格排列
            if( ((code >= 65 && code <= 90) || (code >= 186 && code <= 222)) || value.length >= 20){
                value = value.substr(0,[value.length]-1);
            }else if(value.length <= 18 && ((code >= 48 && code <= 57) || (code >= 96 && code <= 105)) ){
                value = value.replace(/\s/g,'');
                value = value.replace(/(\d{4})/g, '$1 ');
            }
            $(`input[name=${nameKey}]`).val(value);
        },
        //上傳相片相關
        imageUpload(event){
            let vm = this;
            let uploadImg = event.target.files; //呼叫上傳的照片
            let selectFile = [].slice.call(uploadImg); //轉成可使用的陣列
            $('form')[0].reset();  // 重置form表單

            //選取張數與現有張數不得超過三張，且長寬檢查均不超過150px
            if(vm.addFile.length + selectFile.length <=3){
                let task = [];
                //取得照片寬及高度
                selectFile.forEach(function(file){
                    task.push(
                        new Promise((resolve, reject) => {
                            let img = new Image();
                            img.onload = function(){
                                resolve({width:this.width, height:this.height})
                            }
                            img.onerror = function(e){
                                reject(e.type)
                            }
                            img.src = URL.createObjectURL(file)
                        })
                    )
                })
                //逐張檢查照片長寬
                Promise.all(task).then(result =>{
                    if(vm.check.checkImage(result)){
                        selectFile.forEach(function(file){
                            vm.addFile.push(file);
                        });
                        vm.showImage(vm.addFile);
                    }else{
                        $('.warnBlock').text('照片像素尺寸超過150X150').css('display','block'); //顯示尺寸超過
                    }
                });
            }else{
                $('.warnBlock').text('照片選取超過三張').css('display','block'); //顯示超過選取張數
            }
        },
        //刪除照片功能
        deleteImage(event){
            let vm = this;
            let key = event.target.dataset.num;
            vm.addFile.splice(key,1);
            vm.showImage(vm.addFile);
        },
        showImage(list){
            $('.upDate').empty();  //面板移除所有上傳照片
            $('.warnBlock').text('').attr('style','');  //warnBlock回歸初始值
            //利用傳進來的list跑forEach迴圈，將圖片資料渲染於畫面上
            list.forEach(function(item,index){
                let str = ''
                str +=
                `
                <div data-num="${index}" style="background-image:url(${URL.createObjectURL(item)})">
                    <div></div>
                </div>
                `
                ; 
                $('.upDate').append(str);
            })
            //檢查照片總數是否等於3
            if(list.length === 3){
                $('button').removeClass('disable');
                $('button').removeAttr('disabled');
            }else{
                $('button').addClass('disable');
                $('button').attr('disabled', 'disabled');
            }
        }
    },
})