
new Vue({

    el:'#wrapper',
    data:{
        weeklyToggleData:['Daily','Weekly','Monthly','Yearly','Custom'],
        status:'Weekly',
    },
    mounted(){
        this.clickChangeActive(this.status); //執行clickList點擊後active
    },
    methods:{
        //點按選單出現
        toggle(){
            $('nav > ul').slideToggle("slow");
        },
        //時間顯示表單點擊事件
        clickBlock(){
            $('.clickList').slideToggle("slow");
        },
        clickChange(event){
            let vm = this;
            let key = event.toElement.innerText;
            vm.status = key;  //將文字覆蓋上去
            //點擊後添加css
            vm.clickChangeActive(key);
            //執行toggle元件
            vm.clickBlock();
        },
        clickChangeActive(key){
            let vm = this;
            let index = vm.weeklyToggleData.indexOf(key);
            //點擊後添加css
            $(`.clickList > div`).attr('class','');
            $(`.clickList > div:eq(${index})`).attr('class','active');
        },
    },

})