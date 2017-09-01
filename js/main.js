/* MEMO
	BackGround(Event) Page = 後ろで動いているページ（権限強い、DOMアクセス不可）
	ContentScripts = 指定したドメインで読み込まれる追加JS（権限弱い、DOMアクセス可）
	BrowserAction = タスクバーから実行されるポップアップ（権限普通、DOMアクセス不可）
	http://www.apps-gcp.com/calendar-extension/
*/
function jsStorageLoader(name) {
	if ( localStorage.getItem(name) ) {
		return localStorage.getItem(name);
	}
}
function jsStorageSaver(name, val) {
	localStorage.setItem(name, val);
}

$(document).ready(function(){
	$(".js-storage").each(function() {
		var name = $(this).attr("name");

		$(this).val( jsStorageLoader(name) );
	});

	$(".js-storage").bind("blur change", function() {
		var name = $(this).attr("name");
		jsStorageSaver(name, $(this).val());
	});

	// 元のカレンダーからイベントを取得
	$("#check").click(function() {
		var url1 = $("#url1").val();
		var url2 = $("#url2").val();
		var targetform = $("#targetform").val();

		$.when(
			$.get(url1),
			$.get(url2)
		)
		.done(function(data_a, data_b) {
			var save = [];
			var trans = {};

			var data1 = data_a[0];
			var data2 = data_b[0];

			var $data1 = $(data1);
			var $data2 = $(data2);

			// フィールドIDとフィールドラベルの対訳表作成
			$data1.find(targetform).find("input[type=text],select,textarea,input[class='hidden'][id^='customfield_']").each(function() {
				var jaName = $(this).parents(".field").eq(0).find("label").text();
				var enName = $(this).attr("name");

				trans[enName] = jaName;
			});

			// 比較
			$data1.find(targetform).find("input[type=text],select,textarea,input[class='hidden'][id^='customfield_']").each(function() {
				var arr = {};

				arr.label = trans[ $(this).attr("name") ];
				arr.data1 = $(this).val();
				arr.data2 = $data2.find(targetform).find("[name='" + $(this).attr("name") +  "']").val();

				if ( arr.data1 == arr.data2 ) {
					arr.diff = "OK";
				}
				else {
					arr.diff = "NG";
				}

				save.push( arr );
			});

			var tmpl = $("[data-tmpl]").html();
			var html = Mustache.render( tmpl, { items: save });

			$("#table tbody").append(html);
		})
		.fail(function() {
			// エラーがあった時
			console.log('error');
		});
	});
});