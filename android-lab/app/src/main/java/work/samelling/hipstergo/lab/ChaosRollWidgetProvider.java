package work.samelling.hipstergo.lab;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

/** No updates, polling, network access, or WebView required. */
public final class ChaosRollWidgetProvider extends AppWidgetProvider {
    @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_chaos_roll);
            Intent roll = new Intent(context, ChaosRollActivity.class)
                .setAction("work.samelling.hipstergo.lab.CHAOS_ROLL");
            PendingIntent rollTap = PendingIntent.getActivity(context, 0, roll,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.chaos_roll_action, rollTap);

            Intent home = new Intent(context, LabActivity.class);
            PendingIntent homeTap = PendingIntent.getActivity(context, 1, home,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.chaos_roll_open, homeTap);
            manager.updateAppWidget(id, views);
        }
    }
}
