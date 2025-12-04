import java.awt.*;
import java.awt.event.*;
import javax.swing.*;

public class Culebrita extends JFrame {

    public Culebrita() {
        add(new GamePanel());
        setTitle("Juego de Culebrita (Snake)");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setResizable(false);
        pack();
        setLocationRelativeTo(null);
        setVisible(true);
    }

    public static void main(String[] args) {
        new Culebrita();
    }
}

class GamePanel extends JPanel implements ActionListener {

    private static final int SCREEN_WIDTH = 600;
    private static final int SCREEN_HEIGHT = 600;
    private static final int UNIT_SIZE = 25;
    private static final int GAME_UNITS = (SCREEN_WIDTH * SCREEN_HEIGHT) / UNIT_SIZE;
    private static final int DELAY = 100;

    private final int x[] = new int[GAME_UNITS];
    private final int y[] = new int[GAME_UNITS];
    private int bodyParts = 5;
    private int applesEaten;
    private int appleX, appleY;
    private char direction = 'R';
    private boolean running = false;
    private boolean paused = false;
    private Timer timer;

    public GamePanel() {
        setPreferredSize(new Dimension(SCREEN_WIDTH, SCREEN_HEIGHT));
        setBackground(Color.black);
        setFocusable(true);
        addKeyListener(new MyKeyAdapter());
        startGame();
    }

    public void startGame() {
        spawnApple();
        running = true;
        timer = new Timer(DELAY, this);
        timer.start();
    }

    public void resetGame() {
        bodyParts = 5;
        applesEaten = 0;
        direction = 'R';

        for (int i = 0; i < bodyParts; i++) {
            x[i] = 0;
            y[i] = 0;
        }

        spawnApple();
        running = true;
        paused = false;
        timer.restart();
    }

    public void paintComponent(Graphics g) {
        super.paintComponent(g);
        draw(g);
    }

    public void draw(Graphics g) {
        if (running) {
            g.setColor(Color.red);
            g.fillOval(appleX, appleY, UNIT_SIZE, UNIT_SIZE);

            for (int i = 0; i < bodyParts; i++) {
                g.setColor(i == 0 ? Color.green : new Color(45, 180, 0));
                g.fillRect(x[i], y[i], UNIT_SIZE, UNIT_SIZE);
            }

            g.setColor(Color.white);
            g.setFont(new Font("Arial", Font.BOLD, 25));
            FontMetrics metrics = getFontMetrics(g.getFont());
            g.drawString("Puntaje: " + applesEaten,
                    (SCREEN_WIDTH - metrics.stringWidth("Puntaje: " + applesEaten)) / 2,
                    g.getFont().getSize());

            if (paused) {
                g.setColor(Color.yellow);
                g.setFont(new Font("Arial", Font.BOLD, 50));
                FontMetrics m2 = getFontMetrics(g.getFont());
                g.drawString("PAUSA",
                        (SCREEN_WIDTH - m2.stringWidth("PAUSA")) / 2,
                        SCREEN_HEIGHT / 2);
            }

        } else {
            gameOver(g);
        }
    }

    public void spawnApple() {
        appleX = (int) (Math.random() * (SCREEN_WIDTH / UNIT_SIZE)) * UNIT_SIZE;
        appleY = (int) (Math.random() * (SCREEN_HEIGHT / UNIT_SIZE)) * UNIT_SIZE;
    }

    public void move() {
        for (int i = bodyParts; i > 0; i--) {
            x[i] = x[i - 1];
            y[i] = y[i - 1];
        }

        switch (direction) {
            case 'U' -> y[0] -= UNIT_SIZE;
            case 'D' -> y[0] += UNIT_SIZE;
            case 'L' -> x[0] -= UNIT_SIZE;
            case 'R' -> x[0] += UNIT_SIZE;
        }
    }

    public void checkApple() {
        if (x[0] == appleX && y[0] == appleY) {
            bodyParts++;
            applesEaten++;
            spawnApple();
        }
    }

    public void checkCollisions() {
        for (int i = bodyParts; i > 0; i--) {
            if (x[0] == x[i] && y[0] == y[i]) {
                running = false;
                break;
            }
        }
        if (x[0] < 0 || x[0] >= SCREEN_WIDTH || y[0] < 0 || y[0] >= SCREEN_HEIGHT) {
            running = false;
        }

        if (!running)
            timer.stop();
    }

    public void gameOver(Graphics g) {
        g.setColor(Color.red);
        g.setFont(new Font("Arial", Font.BOLD, 60));
        FontMetrics metrics1 = getFontMetrics(g.getFont());
        g.drawString("GAME OVER",
                (SCREEN_WIDTH - metrics1.stringWidth("GAME OVER")) / 2,
                SCREEN_HEIGHT / 2);

        g.setColor(Color.white);
        g.setFont(new Font("Arial", Font.BOLD, 30));
        FontMetrics metrics2 = getFontMetrics(g.getFont());
        g.drawString("Puntaje: " + applesEaten,
                (SCREEN_WIDTH - metrics2.stringWidth("Puntaje: " + applesEaten)) / 2,
                SCREEN_HEIGHT / 2 + 50);

        g.setFont(new Font("Arial", Font.BOLD, 25));
        g.drawString("Presiona R para reiniciar",
                (SCREEN_WIDTH - 300) / 2,
                SCREEN_HEIGHT / 2 + 100);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (running && !paused) {
            move();
            checkApple();
            checkCollisions();
        }
        repaint();
    }

    public class MyKeyAdapter extends KeyAdapter {
        @Override
        public void keyPressed(KeyEvent e) {
            switch (e.getKeyCode()) {

                case KeyEvent.VK_A:
                    if (direction != 'R') direction = 'L';
                    break;
                case KeyEvent.VK_D:
                    if (direction != 'L') direction = 'R';
                    break;
                case KeyEvent.VK_W:
                    if (direction != 'D') direction = 'U';
                    break;
                case KeyEvent.VK_S:
                    if (direction != 'U') direction = 'D';
                    break;

                case KeyEvent.VK_P:
                    paused = !paused;
                    break;

                case KeyEvent.VK_R:
                    if (!running || paused) resetGame();
                    break;
            }
        }
    }
}
