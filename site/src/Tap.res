@module("tap") @val external ok: bool => unit = "ok"
@module("tap") @val external equal: ('a, 'a) => unit = "equal"
@module("tap") @val external same: ('a, 'a) => unit = "same"
