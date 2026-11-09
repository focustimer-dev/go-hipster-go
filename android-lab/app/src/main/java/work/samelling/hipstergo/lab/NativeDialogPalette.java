package work.samelling.hipstergo.lab;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.TextView;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/** Shared native Android dialog colors from the local WebView theme roles. */
final class NativeDialogPalette {
 private static final Set<String> THEMES=new HashSet<>(Arrays.asList(
     "liberi","bosque","usiku","kingston","detroit","addis","polish","beirut"));
 private final Activity activity;
 // The original gold and teal Libéri native dialog remains the fallback.
 private int surface=Color.rgb(223,176,69),ink=Color.rgb(16,49,53);
 private int accent=ink,field=surface,fieldInk=ink,rule=ink;
 private String activeTheme="liberi";
 NativeDialogPalette(Activity activity){this.activity=activity;}
 void update(String theme,String bg,String text,String focus,String input,String inputInk,String stroke){
  if(!THEMES.contains(theme))return;
  try{
   int s=parse(bg),i=parse(text),a=parse(focus),f=parse(input),fi=parse(inputInk),r=parse(stroke);
   if(contrast(s,i)<4.5||contrast(f,fi)<4.5)return;
   if(contrast(s,a)<3)a=i;
   surface=s;ink=i;accent=a;field=f;fieldInk=fi;rule=r;activeTheme=theme;
  }catch(IllegalArgumentException ignored){/* Invalid color data is ignored. */}
 }
 private static int parse(String v){
  if(v==null||!v.matches("#[0-9a-fA-F]{6}"))throw new IllegalArgumentException("Invalid color");
  return Color.parseColor(v);
 }
 private static double linear(double x){return x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4);}
 private static double luminance(int c){
  return linear(Color.red(c)/255.0)*.2126+linear(Color.green(c)/255.0)*.7152
       +linear(Color.blue(c)/255.0)*.0722;
 }
 private static double contrast(int a,int b){
  double x=luminance(a),y=luminance(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
 }
 private int dp(float n){return (int)(n*activity.getResources().getDisplayMetrics().density+.5f);}
 AlertDialog show(AlertDialog.Builder builder){return show(builder.create());}
 AlertDialog show(AlertDialog dialog){
  dialog.setOnShowListener(ignored->paint(dialog));
  dialog.show();return dialog;
 }
 private void paint(AlertDialog dialog){
  // Libéri keeps its existing native gold/teal dialog without any override.
  if("liberi".equals(activeTheme))return;
  Window window=dialog.getWindow();if(window==null)return;
  GradientDrawable paper=new GradientDrawable();
  paper.setColor(surface);paper.setCornerRadius(dp(5));paper.setStroke(dp(1),rule);
  window.setBackgroundDrawable(paper);
  tint(window.getDecorView());
  for(int type:new int[]{AlertDialog.BUTTON_POSITIVE,AlertDialog.BUTTON_NEGATIVE,AlertDialog.BUTTON_NEUTRAL}){
   Button button=dialog.getButton(type);if(button==null)continue;
   button.setTextColor(type==AlertDialog.BUTTON_POSITIVE&&contrast(surface,accent)>=4.5?accent:ink);
   if(type==AlertDialog.BUTTON_POSITIVE){
    GradientDrawable action=new GradientDrawable();
    action.setColor(Color.TRANSPARENT);action.setCornerRadius(dp(2));action.setStroke(dp(1),accent);
    button.setBackground(action);
   }
  }
 }
 private void tint(View view){
  if(view instanceof EditText){
   EditText input=(EditText)view;input.setTextColor(fieldInk);
   input.setHintTextColor(Color.argb(160,Color.red(fieldInk),Color.green(fieldInk),Color.blue(fieldInk)));
   input.setBackgroundTintList(ColorStateList.valueOf(accent));
   GradientDrawable entry=new GradientDrawable();
   entry.setColor(field);entry.setCornerRadius(dp(2));entry.setStroke(dp(1),accent);
   input.setBackground(entry);
  }else if(view instanceof CompoundButton){
   CompoundButton choice=(CompoundButton)view;choice.setTextColor(ink);
   choice.setButtonTintList(ColorStateList.valueOf(accent));
  }else if(view instanceof TextView)((TextView)view).setTextColor(ink);
  if(view instanceof ViewGroup){
   ViewGroup group=(ViewGroup)view;
   for(int n=0;n<group.getChildCount();n++)tint(group.getChildAt(n));
  }
 }
}
